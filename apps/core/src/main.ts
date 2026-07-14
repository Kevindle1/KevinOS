import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import {
  loadConfig,
  createLogger,
  KEVINOS_VERSIONS,
  moduleManifestSchema,
  type Logger,
  type KevinConfig,
} from '@kevinos/shared';
import { HealthService } from './application/health-service.js';
import { ModuleRegistry } from './application/module-registry.js';
import { PhotoService } from './application/photo-service.js';
import { KaiOrchestrator } from './application/kai-orchestrator.js';
import type { KaiModuleInfo } from './domain/kai/capabilities.js';
import type { ReadinessCheck } from './domain/readiness.js';
import { ImmichPhotoAdapter } from './infrastructure/immich/immich-photo-adapter.js';
import { createAIProvider } from './infrastructure/ai/provider-factory.js';
import { createApp, type AppDependencies } from './interfaces/http/app.js';

/** Version applicative (alignée sur le package). */
const KEVINOS_VERSION = '0.1.0';

/** Mots-clés d'ouverture par module (pour la capacité « ouvrir un module »). */
const MODULE_KEYWORDS: Record<string, string[]> = {
  'kos-vision': ['photo', 'photos', 'vision', 'image', 'images', 'album', 'albums'],
  'kos-media': ['film', 'films', 'série', 'series', 'média', 'media', 'regarder'],
  'kos-drive': ['fichier', 'fichiers', 'document', 'documents', 'drive'],
  'kos-home': ['maison', 'domotique', 'appareil', 'appareils', 'lumière', 'caméra'],
};

function moduleInfos(registry: ModuleRegistry): KaiModuleInfo[] {
  return registry.list().map((m) => ({
    id: m.manifest.id,
    name: m.manifest.name,
    keywords: MODULE_KEYWORDS[m.manifest.id] ?? [m.manifest.name.toLowerCase()],
  }));
}

/** Lit un secret depuis un fichier (`*_FILE`) ou une variable directe. */
function readSecret(fileVar?: string, directVar?: string): string | null {
  if (fileVar) {
    try {
      return readFileSync(fileVar, 'utf8').trim();
    } catch {
      return null;
    }
  }
  return directVar && directVar.length > 0 ? directVar : null;
}

/**
 * Assemble KOS Vision (photos) si le moteur est configuré. Sans clé d'API, le
 * module reste désactivé — le reste de KevinOS fonctionne (mode dégradé, ENF-13).
 */
function buildPhotos(
  config: KevinConfig,
  registry: ModuleRegistry,
  logger: Logger,
): { deps: NonNullable<AppDependencies['photos']>; readiness: ReadinessCheck } | null {
  const apiKey = readSecret(
    process.env.KEVINOS_IMMICH_API_KEY_FILE,
    process.env.KEVINOS_IMMICH_API_KEY,
  );
  if (!apiKey) {
    logger.warn('KOS Vision désactivé : aucune clé API moteur photos configurée');
    return null;
  }

  const adapter = new ImmichPhotoAdapter({ baseUrl: config.immichBaseUrl, apiKey });

  // Enregistrement du module (garde de compatibilité — ADR-0008).
  const manifest = moduleManifestSchema.parse({
    id: 'kos-vision',
    name: 'KOS Vision',
    version: '1.0.0',
    implementation: 'immich',
    capabilities: ['photos'],
    internalUrl: config.immichBaseUrl,
    healthPath: '/server/ping',
    enabled: true,
  });
  const result = registry.register(manifest);
  if (!result.ok) {
    logger.error({ reasons: result.reasons }, 'KOS Vision refusé par le registre');
    return null;
  }

  return {
    deps: { service: new PhotoService(adapter), thumbnails: adapter },
    readiness: { name: 'kos-vision', check: (signal) => adapter.isAvailable(signal) },
  };
}

/**
 * Point d'entrée / racine de composition du Core.
 * Fail-fast : une configuration invalide arrête le processus immédiatement.
 */
function main(): void {
  const config = loadConfig();
  const logger = createLogger({ serviceName: config.serviceName, level: config.logLevel });

  const startedAt = Date.now();
  const moduleRegistry = new ModuleRegistry();
  const photos = buildPhotos(config, moduleRegistry, logger);

  const healthService = new HealthService({
    serviceName: config.serviceName,
    version: KEVINOS_VERSION,
    checks: photos ? [photos.readiness] : [],
  });

  // KAI — cerveau et point d'entrée unique. Fournisseur IA interchangeable
  // (local/Ollama par défaut) ; les capacités déterministes marchent sans modèle.
  const kai = new KaiOrchestrator({
    provider: createAIProvider(config),
    logger,
    context: () => ({
      now: new Date(),
      system: { version: KEVINOS_VERSION, startedAt },
      modules: moduleInfos(moduleRegistry),
    }),
  });

  const app = createApp({
    logger,
    healthService,
    moduleRegistry,
    kai,
    ...(photos ? { photos: photos.deps } : {}),
  });
  const server = createServer(app);

  server.listen(config.port, config.host, () => {
    logger.info(
      {
        host: config.host,
        port: config.port,
        env: config.nodeEnv,
        ai: config.aiProvider,
        versions: KEVINOS_VERSIONS,
        modules: moduleRegistry.list().map((m) => m.manifest.id),
      },
      'KevinOS Core démarré',
    );
  });

  // Arrêt gracieux : on cesse d'accepter des connexions puis on quitte.
  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'arrêt en cours…');
    server.close((err) => {
      if (err) {
        logger.error({ err }, "erreur lors de l'arrêt");
        process.exit(1);
      }
      logger.info('arrêt propre terminé');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
