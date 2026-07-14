import { Router } from 'express';
import type { MediaKind } from '@kevinos/shared';
import type { MediaService } from '../../../application/media-service.js';
import type { MediaImages } from '../../../domain/media-images.js';

/**
 * API v1 de KOS Media — `/api/v1/media/*` (API-first, Règle 3). **Même patron**
 * que `/api/v1/photos/*`. Aucune mention de Jellyfin n'y transparaît.
 */
export function mediaRoutes(service: MediaService, images: MediaImages): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const kind =
        req.query.kind === 'series' || req.query.kind === 'movie'
          ? (req.query.kind as MediaKind)
          : undefined;
      res.json(await service.browse(kind));
    } catch (err) {
      next(err);
    }
  });

  router.get('/continue', async (_req, res, next) => {
    try {
      res.json(await service.continueWatching());
    } catch (err) {
      next(err);
    }
  });

  router.get('/recent', async (_req, res, next) => {
    try {
      res.json(await service.recentlyAdded());
    } catch (err) {
      next(err);
    }
  });

  router.get('/search', async (req, res, next) => {
    try {
      const text = typeof req.query.q === 'string' ? req.query.q : '';
      if (!text) {
        res.status(400).json({ error: 'parametre_q_requis' });
        return;
      }
      res.json(await service.search(text));
    } catch (err) {
      next(err);
    }
  });

  router.get('/collections', async (_req, res, next) => {
    try {
      res.json(await service.listCollections());
    } catch (err) {
      next(err);
    }
  });

  router.get('/favorites', async (_req, res, next) => {
    try {
      res.json(await service.favorites());
    } catch (err) {
      next(err);
    }
  });

  router.get('/history', async (_req, res, next) => {
    try {
      res.json(await service.history());
    } catch (err) {
      next(err);
    }
  });

  router.get('/movies/:id', async (req, res, next) => {
    try {
      res.json(await service.getMovie(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.get('/series/:id', async (req, res, next) => {
    try {
      res.json(await service.getSeries(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  // Proxy binaire des affiches : le client ne joint jamais le moteur.
  router.get('/:id/poster', async (req, res, next) => {
    try {
      const { body, contentType } = await images.fetchPoster(req.params.id);
      res.setHeader('content-type', contentType);
      res.setHeader('cache-control', 'private, max-age=86400');
      res.send(Buffer.from(body));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
