import { Router } from 'express';
import type { HealthService } from '../../../application/health-service.js';

/**
 * Routes de santé, consommées par Docker/monitoring (Uptime Kuma, Prometheus).
 *
 * - `GET /health` : liveness — 200 tant que le processus répond.
 * - `GET /ready`  : readiness — 200 si prêt, 503 si dégradé.
 */
export function healthRoutes(healthService: HealthService): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json(healthService.liveness());
  });

  router.get('/ready', async (_req, res, next) => {
    try {
      const result = await healthService.readiness();
      res.status(result.status === 'ready' ? 200 : 503).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
