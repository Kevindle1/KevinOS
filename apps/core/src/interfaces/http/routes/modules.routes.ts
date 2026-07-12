import { Router } from 'express';
import { KEVINOS_VERSIONS } from '@kevinos/shared';
import type { ModuleRegistry } from '../../../application/module-registry.js';

/**
 * Expose l'état du registre de modules et les versions de contrat de l'hôte.
 *
 * - `GET /modules`  : liste des modules montés (id, nom, version, capacités, santé).
 * - `GET /versions` : versions de contrat publiées (core, api, pluginInterface).
 *
 * (Lecture seule en Phase 0 ; l'enregistrement se fera via le chargement des
 * manifestes, pas via HTTP.)
 */
export function modulesRoutes(registry: ModuleRegistry): Router {
  const router = Router();

  router.get('/versions', (_req, res) => {
    res.status(200).json(KEVINOS_VERSIONS);
  });

  router.get('/modules', (_req, res) => {
    res.status(200).json({
      host: KEVINOS_VERSIONS,
      count: registry.size,
      modules: registry.list().map((m) => ({
        id: m.manifest.id,
        name: m.manifest.name,
        version: m.manifest.version,
        implementation: m.manifest.implementation,
        capabilities: m.manifest.capabilities,
        compat: m.manifest.compat,
        enabled: m.manifest.enabled,
        health: m.health,
      })),
    });
  });

  return router;
}
