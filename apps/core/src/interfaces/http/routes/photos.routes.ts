import { Router } from 'express';
import type { PhotoService } from '../../../application/photo-service.js';
import type { PhotoThumbnails } from '../../../domain/photo-thumbnails.js';

/**
 * API v1 de KOS Vision — `/api/v1/photos/*` (API-first, Règle 3).
 *
 * Ces routes sont le contrat public : Dashboard, KAI, app mobile et API publique
 * les consomment de façon identique. Aucune mention d'Immich n'y transparaît.
 */
export function photosRoutes(service: PhotoService, thumbnails: PhotoThumbnails): Router {
  const router = Router();

  // Timeline paginée.
  router.get('/', async (req, res, next) => {
    try {
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      res.json(await service.browse(cursor, limit));
    } catch (err) {
      next(err);
    }
  });

  // Recherche : /search?q=...&from=...&to=...&personIds=a,b&limit=50
  router.get('/search', async (req, res, next) => {
    try {
      const text = typeof req.query.q === 'string' ? req.query.q : '';
      if (!text) {
        res.status(400).json({ error: 'parametre_q_requis' });
        return;
      }
      const personIds =
        typeof req.query.personIds === 'string' && req.query.personIds.length > 0
          ? req.query.personIds.split(',')
          : undefined;
      res.json(
        await service.search({
          text,
          ...(personIds ? { personIds } : {}),
          ...(typeof req.query.from === 'string' ? { from: req.query.from } : {}),
          ...(typeof req.query.to === 'string' ? { to: req.query.to } : {}),
          ...(req.query.limit ? { limit: Number(req.query.limit) } : {}),
        }),
      );
    } catch (err) {
      next(err);
    }
  });

  router.get('/albums', async (_req, res, next) => {
    try {
      res.json(await service.listAlbums());
    } catch (err) {
      next(err);
    }
  });

  router.get('/albums/:id', async (req, res, next) => {
    try {
      res.json(await service.getAlbum(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.get('/people', async (_req, res, next) => {
    try {
      res.json(await service.listPeople());
    } catch (err) {
      next(err);
    }
  });

  router.get('/memories', async (_req, res, next) => {
    try {
      res.json(await service.getMemories());
    } catch (err) {
      next(err);
    }
  });

  router.get('/map', async (_req, res, next) => {
    try {
      res.json(await service.getMapPoints());
    } catch (err) {
      next(err);
    }
  });

  router.get('/usage', async (_req, res, next) => {
    try {
      res.json(await service.getUsage());
    } catch (err) {
      next(err);
    }
  });

  // Proxy binaire des miniatures : le client ne joint jamais le moteur.
  router.get('/:id/thumbnail', async (req, res, next) => {
    try {
      const { body, contentType } = await thumbnails.fetchThumbnail(req.params.id);
      res.setHeader('content-type', contentType);
      res.setHeader('cache-control', 'private, max-age=86400');
      res.send(Buffer.from(body));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
