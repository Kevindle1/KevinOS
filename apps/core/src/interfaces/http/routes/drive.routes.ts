import { Router } from 'express';
import type { DocKind, DriveSearchQuery } from '@kevinos/shared';
import type { DriveService } from '../../../application/drive-service.js';
import type { DriveContent } from '../../../domain/drive-content.js';

const DOC_KINDS: DocKind[] = [
  'pdf',
  'image',
  'markdown',
  'text',
  'csv',
  'json',
  'code',
  'word',
  'excel',
  'powerpoint',
  'other',
];

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * API v1 de KOS Drive — `/api/v1/drive/*` (API-first, Règle 3). **Même patron**
 * que `/api/v1/media/*`. Aucune mention du moteur (système de fichiers,
 * Nextcloud) n'y transparaît : même les octets d'un document sont **proxifiés**
 * par le Core. Les identifiants sont opaques (jamais un chemin disque).
 */
export function driveRoutes(service: DriveService, content: DriveContent): Router {
  const router = Router();

  // — Vues (segments fixes : déclarés AVANT `/:id`). —
  router.get('/', async (req, res, next) => {
    try {
      res.json(await service.list(str(req.query.folder)));
    } catch (err) {
      next(err);
    }
  });

  router.get('/search', async (req, res, next) => {
    try {
      const docKind = DOC_KINDS.find((k) => k === req.query.type);
      const query: DriveSearchQuery = { content: req.query.content === '1' };
      const text = str(req.query.q);
      if (text) query.text = text;
      if (docKind) query.docKind = docKind;
      const folder = str(req.query.folder);
      if (folder) query.folderId = folder;
      const after = str(req.query.after);
      if (after) query.modifiedAfter = after;
      const before = str(req.query.before);
      if (before) query.modifiedBefore = before;
      res.json(await service.search(query));
    } catch (err) {
      next(err);
    }
  });

  router.get('/recent', async (_req, res, next) => {
    try {
      res.json(await service.recent());
    } catch (err) {
      next(err);
    }
  });

  router.get('/largest', async (_req, res, next) => {
    try {
      res.json(await service.largest());
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

  router.get('/shared', async (_req, res, next) => {
    try {
      res.json(await service.shared());
    } catch (err) {
      next(err);
    }
  });

  router.get('/trash', async (_req, res, next) => {
    try {
      res.json(await service.trash());
    } catch (err) {
      next(err);
    }
  });

  router.post('/folders', async (req, res, next) => {
    try {
      const { parentId, name } = req.body ?? {};
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'nom_requis' });
        return;
      }
      res.json(await service.createFolder(typeof parentId === 'string' ? parentId : null, name));
    } catch (err) {
      next(err);
    }
  });

  // — Aperçu & contenu. —
  router.get('/:id/preview', async (req, res, next) => {
    try {
      res.json(await service.preview(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  // Octets proxifiés (aperçu inline / téléchargement). Range géré.
  router.get('/:id/raw', async (req, res, next) => {
    try {
      const range = typeof req.headers.range === 'string' ? req.headers.range : undefined;
      const { status, headers, filename, stream } = await content.fetchRaw(req.params.id, range);
      res.status(status);
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
      const disposition = req.query.download === '1' ? 'attachment' : 'inline';
      res.setHeader(
        'content-disposition',
        `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      );
      if (stream) stream.pipe(res);
      else res.end();
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id/history', async (req, res, next) => {
    try {
      res.json(await service.history(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  // — Mutations. —
  router.post('/:id/rename', async (req, res, next) => {
    try {
      const { name } = req.body ?? {};
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'nom_requis' });
        return;
      }
      res.json(await service.rename(req.params.id, name));
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/move', async (req, res, next) => {
    try {
      const { targetFolderId } = req.body ?? {};
      res.json(
        await service.move(
          req.params.id,
          typeof targetFolderId === 'string' ? targetFolderId : null,
        ),
      );
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/copy', async (req, res, next) => {
    try {
      const { targetFolderId } = req.body ?? {};
      res.json(
        await service.copy(
          req.params.id,
          typeof targetFolderId === 'string' ? targetFolderId : null,
        ),
      );
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/favorite', async (req, res, next) => {
    try {
      res.json(await service.setFavorite(req.params.id, req.body?.favorite !== false));
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/tags', async (req, res, next) => {
    try {
      const tags = Array.isArray(req.body?.tags)
        ? (req.body.tags as unknown[]).filter((t): t is string => typeof t === 'string')
        : [];
      res.json(await service.setTags(req.params.id, tags));
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/restore', async (req, res, next) => {
    try {
      res.json(await service.restore(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await service.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // Métadonnées d'un item (déclaré après les sous-chemins `/:id/...`).
  router.get('/:id', async (req, res, next) => {
    try {
      res.json(await service.getItem(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
