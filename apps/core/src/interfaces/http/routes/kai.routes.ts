import { Router } from 'express';
import { kaiTurnRequestSchema } from '@kevinos/shared';
import type { KaiOrchestrator } from '../../../application/kai-orchestrator.js';

/**
 * API v1 de **KAI** — `/api/v1/kai/*` (API-first, Règle 3). C'est le point
 * d'entrée unique : Home, une future app mobile ou une API publique postent un
 * message et reçoivent une réponse structurée (texte + actions éventuelles).
 */
export function kaiRoutes(orchestrator: KaiOrchestrator): Router {
  const router = Router();

  router.post('/message', async (req, res, next) => {
    const parsed = kaiTurnRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'requete_invalide' });
      return;
    }
    try {
      res.json(await orchestrator.handle(parsed.data.message));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
