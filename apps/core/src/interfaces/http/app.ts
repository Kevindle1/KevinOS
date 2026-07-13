import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { pinoHttp } from 'pino-http';
import type { Logger } from '@kevinos/shared';
import type { HealthService } from '../../application/health-service.js';
import type { ModuleRegistry } from '../../application/module-registry.js';
import type { PhotoService } from '../../application/photo-service.js';
import type { PhotoThumbnails } from '../../domain/photo-thumbnails.js';
import { healthRoutes } from './routes/health.routes.js';
import { modulesRoutes } from './routes/modules.routes.js';
import { photosRoutes } from './routes/photos.routes.js';

export interface AppDependencies {
  logger: Logger;
  healthService: HealthService;
  moduleRegistry: ModuleRegistry;
  /** KOS Vision — présent quand le module photos est activé. */
  photos?: { service: PhotoService; thumbnails: PhotoThumbnails };
}

/**
 * Construit l'application Express du Core à partir de ses dépendances
 * (injection explicite — testable sans démarrer de serveur ni de réseau).
 */
export function createApp({
  logger,
  healthService,
  moduleRegistry,
  photos,
}: AppDependencies): Express {
  const app = express();

  // Journalisation structurée de chaque requête (corrélée dans Loki).
  app.use(pinoHttp({ logger }));
  app.use(express.json());

  // Sondes de santé (non authentifiées : nécessaires au monitoring).
  app.use(healthRoutes(healthService));

  // Registre de modules & versions de contrat.
  app.use(modulesRoutes(moduleRegistry));

  // API v1 des modules. KOS Vision (photos) si activé.
  if (photos) {
    app.use('/api/v1/photos', photosRoutes(photos.service, photos.thumbnails));
  }

  // Racine : identité du service (utile au diagnostic).
  app.get('/', (_req, res) => {
    res.json({ name: 'KevinOS Core', message: 'Tout passe par KAI.' });
  });

  // 404 explicite et homogène.
  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  // Gestion d'erreurs centralisée : on journalise et on ne fuit rien au client.
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    req.log.error({ err }, 'unhandled_error');
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}
