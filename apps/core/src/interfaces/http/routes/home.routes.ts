import { Router } from 'express';
import type { HomeCommand, HomeCommandType, HomeDeviceKind } from '@kevinos/shared';
import type { HomeService } from '../../../application/home-service.js';

const COMMANDS: HomeCommandType[] = [
  'turn_on',
  'turn_off',
  'toggle',
  'open',
  'close',
  'set_brightness',
  'set_temperature',
  'activate_scene',
];
const KINDS: HomeDeviceKind[] = [
  'light',
  'plug',
  'thermostat',
  'temperature',
  'camera',
  'door',
  'cover',
  'sensor',
  'energy',
  'presence',
];

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/** Instantané caméra **généré par le Core** (placeholder honnête, pas un vrai flux). */
function snapshotSvg(name: string, iso: string): string {
  const t = new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">` +
    `<rect width="640" height="360" fill="#0f1113"/>` +
    `<circle cx="320" cy="150" r="46" fill="none" stroke="#2FBEB4" stroke-width="3"/>` +
    `<circle cx="320" cy="150" r="8" fill="#2FBEB4"/>` +
    `<text x="24" y="336" font-family="monospace" font-size="20" fill="#e5e7eb">${name}</text>` +
    `<text x="616" y="40" text-anchor="end" font-family="monospace" font-size="18" fill="#ef6f6f">● REC ${t}</text>` +
    `</svg>`
  );
}

/**
 * API v1 de KOS Home — `/api/v1/home/*` (API-first, Règle 3). **Même patron** que
 * `/api/v1/media/*`. Aucune mention du moteur (Home Assistant, Frigate) : les
 * instantanés caméra sont **générés/proxifiés** par le Core.
 */
export function homeRoutes(service: HomeService): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await service.overview());
    } catch (err) {
      next(err);
    }
  });

  router.get('/rooms', async (_req, res, next) => {
    try {
      res.json(await service.rooms());
    } catch (err) {
      next(err);
    }
  });

  router.get('/devices', async (req, res, next) => {
    try {
      const kind = KINDS.find((k) => k === req.query.kind);
      res.json(
        await service.listDevices({
          ...(str(req.query.room) ? { room: str(req.query.room) as string } : {}),
          ...(kind ? { kind } : {}),
        }),
      );
    } catch (err) {
      next(err);
    }
  });

  router.get('/scenes', async (_req, res, next) => {
    try {
      res.json(await service.listScenes());
    } catch (err) {
      next(err);
    }
  });

  router.post('/scenes/:id/activate', async (req, res, next) => {
    try {
      res.json(await service.activateScene(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  // Pilotage : « allume la lumière du salon », « éteins toutes les lumières »…
  router.post('/command', async (req, res, next) => {
    try {
      const body = req.body ?? {};
      const command = COMMANDS.find((c) => c === body.command);
      if (!command) {
        res.status(400).json({ error: 'commande_invalide' });
        return;
      }
      if (command === 'activate_scene') {
        if (typeof body.scene !== 'string') {
          res.status(400).json({ error: 'ambiance_requise' });
          return;
        }
        res.json(await service.activateScene(body.scene));
        return;
      }
      const kind = KINDS.find((k) => k === body.deviceKind);
      const cmd: HomeCommand = {
        command,
        ...(kind ? { deviceKind: kind } : {}),
        ...(typeof body.room === 'string' ? { room: body.room } : {}),
        ...(typeof body.deviceId === 'string' ? { deviceId: body.deviceId } : {}),
        ...(typeof body.value === 'number' ? { value: body.value } : {}),
      };
      res.json(await service.runCommand(cmd));
    } catch (err) {
      next(err);
    }
  });

  router.get('/cameras', async (_req, res, next) => {
    try {
      res.json(await service.cameras());
    } catch (err) {
      next(err);
    }
  });

  router.get('/cameras/:id/snapshot', async (req, res, next) => {
    try {
      const cams = await service.cameras();
      const cam = cams.find((c) => c.id === req.params.id);
      res.setHeader('content-type', 'image/svg+xml');
      res.setHeader('cache-control', 'no-store');
      res.send(snapshotSvg(cam?.name ?? 'Caméra', new Date().toISOString()));
    } catch (err) {
      next(err);
    }
  });

  router.get('/events', async (req, res, next) => {
    try {
      res.json(
        await service.cameraEvents({
          ...(str(req.query.camera) ? { cameraId: str(req.query.camera) as string } : {}),
          ...(str(req.query.since) ? { sinceIso: str(req.query.since) as string } : {}),
        }),
      );
    } catch (err) {
      next(err);
    }
  });

  router.get('/energy', async (_req, res, next) => {
    try {
      res.json(await service.energy());
    } catch (err) {
      next(err);
    }
  });

  router.get('/presence', async (_req, res, next) => {
    try {
      res.json(await service.presence());
    } catch (err) {
      next(err);
    }
  });

  router.get('/climate', async (req, res, next) => {
    try {
      res.json(await service.climate(str(req.query.room)));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
