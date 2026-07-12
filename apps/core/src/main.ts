import { createServer } from 'node:http';
import { loadConfig, createLogger, KEVINOS_VERSIONS } from '@kevinos/shared';
import { HealthService } from './application/health-service.js';
import { ModuleRegistry } from './application/module-registry.js';
import { createApp } from './interfaces/http/app.js';

/** Version applicative (alignée sur le package). */
const KEVINOS_VERSION = '0.1.0';

/**
 * Point d'entrée / racine de composition du Core.
 *
 * On assemble ici les dépendances concrètes puis on démarre le serveur HTTP.
 * Fail-fast : une configuration invalide arrête le processus immédiatement.
 */
function main(): void {
  const config = loadConfig();
  const logger = createLogger({ serviceName: config.serviceName, level: config.logLevel });

  // En Phase 0, aucune dépendance externe n'est encore branchée : la readiness
  // est « ready » par défaut. Les checks (Postgres, KAI…) seront injectés ici
  // au fil des phases suivantes, sans toucher aux couches domaine/application.
  const healthService = new HealthService({
    serviceName: config.serviceName,
    version: KEVINOS_VERSION,
    checks: [],
  });

  // Registre de modules. En Phase 0, aucun module n'est encore monté : les
  // manifestes (deploy/modules/) seront chargés ici au fil des phases, chacun
  // passant par la garde de compatibilité (ADR-0008).
  const moduleRegistry = new ModuleRegistry();

  const app = createApp({ logger, healthService, moduleRegistry });
  const server = createServer(app);

  server.listen(config.port, config.host, () => {
    logger.info(
      {
        host: config.host,
        port: config.port,
        env: config.nodeEnv,
        ai: config.aiProvider,
        versions: KEVINOS_VERSIONS,
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
    // Filet de sécurité si des connexions traînent.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
