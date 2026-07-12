import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createLogger } from '@kevinos/shared';
import { HealthService } from '../../application/health-service.js';
import type { ReadinessCheck } from '../../domain/readiness.js';
import { createApp } from './app.js';

function buildApp(checks: ReadinessCheck[] = []): Express {
  const logger = createLogger({ serviceName: 'core-test', level: 'silent' });
  const healthService = new HealthService({
    serviceName: 'core-test',
    version: '0.0.0-test',
    checks,
  });
  return createApp({ logger, healthService });
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
});
