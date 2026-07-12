import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createLogger, moduleManifestSchema } from '@kevinos/shared';
import { HealthService } from '../../application/health-service.js';
import { ModuleRegistry } from '../../application/module-registry.js';
import type { ReadinessCheck } from '../../domain/readiness.js';
import { createApp } from './app.js';

function buildApp(checks: ReadinessCheck[] = [], registry = new ModuleRegistry()): Express {
  const logger = createLogger({ serviceName: 'core-test', level: 'silent' });
  const healthService = new HealthService({
    serviceName: 'core-test',
    version: '0.0.0-test',
    checks,
  });
  return createApp({ logger, healthService, moduleRegistry: registry });
}

describe('KevinOS Core — HTTP', () => {
  let app: Express;
  beforeAll(() => {
    app = buildApp();
  });

  it('GET /health renvoie 200 et le statut ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('core-test');
  });

  it('GET /ready renvoie 200 « ready » sans dépendance', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('GET /ready renvoie 503 « degraded » si une dépendance est down', async () => {
    const failing: ReadinessCheck = { name: 'postgres', check: async () => false };
    const res = await request(buildApp([failing])).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.checks.postgres).toBe('down');
  });

  it('renvoie 404 JSON sur une route inconnue', async () => {
    const res = await request(app).get('/inconnu');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not_found');
  });

  it("GET /versions expose les versions de contrat de l'hôte", async () => {
    const res = await request(app).get('/versions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pluginInterface');
    expect(res.body).toHaveProperty('api');
    expect(res.body).toHaveProperty('core');
  });

  it('GET /modules liste les modules montés', async () => {
    const registry = new ModuleRegistry();
    registry.register(
      moduleManifestSchema.parse({
        id: 'kevin-files',
        name: 'Kevin Files',
        version: '1.0.0',
        implementation: 'kevin-files-native',
        capabilities: ['files'],
        internalUrl: 'http://kevin-files:8080',
      }),
    );
    const res = await request(buildApp([], registry)).get('/modules');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.modules[0].id).toBe('kevin-files');
    expect(res.body.modules[0].version).toBe('1.0.0');
  });
});
