import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
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
import { MediaService } from './application/media-service.js';
import { DriveService } from './application/drive-service.js';
import { HomeService } from './application/home-service.js';
import { KaiOrchestrator } from './application/kai-orchestrator.js';
import type { KaiModuleInfo } from './domain/kai/capabilities.js';
import type { ReadinessCheck } from './domain/readiness.js';
import { ImmichPhotoAdapter } from './infrastructure/immich/immich-photo-adapter.js';
import { JellyfinMediaAdapter } from './infrastructure/jellyfin/jellyfin-media-adapter.js';
import { FilePlaybackStore } from './infrastructure/playback/file-playback-store.js';
import { LocalFsDriveAdapter } from './infrastructure/drive/local-fs-drive-adapter.js';
import { FileDriveMetadataStore } from './infrastructure/drive/file-drive-metadata-store.js';
import { InMemoryHomeAdapter } from './infrastructure/home/in-memory-home-adapter.js';
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
 * Assemble KOS Media (films & séries) si le moteur est configuré. **Même patron
 * que `buildPhotos`** : sans clé d'API, le module reste désactivé — le reste de
 * KevinOS fonctionne (mode dégradé). C'est la preuve de la modularité : ajouter
 * une compétence n'a demandé aucune modification du cœur (KAI, providers).
 */
function buildMedia(
  config: KevinConfig,
  registry: ModuleRegistry,
  logger: Logger,
): { deps: NonNullable<AppDependencies['media']>; readiness: ReadinessCheck } | null {
  const apiKey = readSecret(
    process.env.KEVINOS_JELLYFIN_API_KEY_FILE,
    process.env.KEVINOS_JELLYFIN_API_KEY,
  );
  if (!apiKey) {
    logger.warn('KOS Media désactivé : aucune clé API moteur média configurée');
    return null;
  }

  const adapter = new JellyfinMediaAdapter({
    baseUrl: config.jellyfinBaseUrl,
    apiKey,
    ...(process.env.KEVINOS_JELLYFIN_USER_ID
      ? { userId: process.env.KEVINOS_JELLYFIN_USER_ID }
      : {}),
  });

  const manifest = moduleManifestSchema.parse({
    id: 'kos-media',
    name: 'KOS Media',
    version: '1.0.0',
    implementation: 'jellyfin',
    capabilities: ['media'],
    internalUrl: config.jellyfinBaseUrl,
    healthPath: '/System/Info/Public',
    enabled: true,
  });
  const result = registry.register(manifest);
  if (!result.ok) {
    logger.error({ reasons: result.reasons }, 'KOS Media refusé par le registre');
    return null;
  }

  // Progression **possédée par KevinOS** (fichier JSON — offline-first).
  const dataDir = process.env.KEVINOS_DATA_DIR ?? './data';
  const store = new FilePlaybackStore(`${dataDir}/playback.json`);

  return {
    deps: { service: new MediaService(adapter, store), images: adapter, streaming: adapter },
    readiness: { name: 'kos-media', check: (signal) => adapter.isAvailable(signal) },
  };
}

/**
 * Assemble KOS Drive (documents) si une racine documentaire existe. **Même
 * patron que `buildMedia`** : le moteur V1 est le **système de fichiers local**
 * (`config.driveRoot`), caché derrière `DriveLibrary`. Sans dossier accessible,
 * le module reste désactivé — le reste de KevinOS fonctionne (mode dégradé). Les
 * favoris/étiquettes sont **possédés par KevinOS** (fichier JSON, hors moteur).
 */
function buildDrive(
  config: KevinConfig,
  registry: ModuleRegistry,
  logger: Logger,
): { deps: NonNullable<AppDependencies['drive']>; readiness: ReadinessCheck } | null {
  // Le « moteur » est un dossier accessible. Absent → module désactivé (mode
  // dégradé), comme KOS Media sans clé d'API.
  try {
    if (!statSync(config.driveRoot).isDirectory()) throw new Error('pas un dossier');
  } catch {
    logger.warn(
      { driveRoot: config.driveRoot },
      'KOS Drive désactivé : racine documentaire inaccessible (KEVINOS_DRIVE_ROOT)',
    );
    return null;
  }

  const dataDir = process.env.KEVINOS_DATA_DIR ?? './data';
  const metadata = new FileDriveMetadataStore(`${dataDir}/drive-metadata.json`);
  const adapter = new LocalFsDriveAdapter({ root: config.driveRoot, metadata });

  const manifest = moduleManifestSchema.parse({
    id: 'kos-drive',
    name: 'KOS Drive',
    version: '1.0.0',
    implementation: 'local-fs',
    capabilities: ['files'],
    internalUrl: 'file://local',
    healthPath: '/',
    enabled: true,
  });
  const result = registry.register(manifest);
  if (!result.ok) {
    logger.error({ reasons: result.reasons }, 'KOS Drive refusé par le registre');
    return null;
  }

  return {
    deps: { service: new DriveService(adapter), content: adapter },
    readiness: { name: 'kos-drive', check: () => adapter.isAvailable() },
  };
}

/**
 * Assemble KOS Home (maison). **Toujours actif** : le moteur V1 est une **maison
 * simulée en mémoire** (aucune configuration requise), remplaçable par Home
 * Assistant / Frigate sans toucher à KAI ni à Home. C'est la même architecture
 * que Vision/Media/Drive, avec un moteur intégré au lieu d'un serveur externe.
 */
function buildHome(
  registry: ModuleRegistry,
  logger: Logger,
  startedAtIso: string,
): { deps: NonNullable<AppDependencies['home']>; readiness: ReadinessCheck } | null {
  const adapter = new InMemoryHomeAdapter(startedAtIso);

  const manifest = moduleManifestSchema.parse({
    id: 'kos-home',
    name: 'KOS Home',
    version: '1.0.0',
    implementation: 'in-memory',
    capabilities: ['home'],
    internalUrl: 'memory://home',
    healthPath: '/',
    enabled: true,
  });
  const result = registry.register(manifest);
  if (!result.ok) {
    logger.error({ reasons: result.reasons }, 'KOS Home refusé par le registre');
    return null;
  }

  return {
    deps: { service: new HomeService(adapter) },
    readiness: { name: 'kos-home', check: () => adapter.isAvailable() },
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
  const media = buildMedia(config, moduleRegistry, logger);
  const drive = buildDrive(config, moduleRegistry, logger);
  const home = buildHome(moduleRegistry, logger, new Date(startedAt).toISOString());

  const healthService = new HealthService({
    serviceName: config.serviceName,
    version: KEVINOS_VERSION,
    checks: [
      ...(photos ? [photos.readiness] : []),
      ...(media ? [media.readiness] : []),
      ...(drive ? [drive.readiness] : []),
      ...(home ? [home.readiness] : []),
    ],
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
    ...(media ? { media: media.deps } : {}),
    ...(drive ? { drive: drive.deps } : {}),
    ...(home ? { home: home.deps } : {}),
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
