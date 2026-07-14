import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createLogger, moduleManifestSchema, type AIProvider } from '@kevinos/shared';
import { HealthService } from '../../application/health-service.js';
import { ModuleRegistry } from '../../application/module-registry.js';
import { KaiOrchestrator } from '../../application/kai-orchestrator.js';
import type { ReadinessCheck } from '../../domain/readiness.js';
import { createApp } from './app.js';

/** Fournisseur IA de test — jamais joignable (force le mode capacités/repli). */
const offlineProvider: AIProvider = {
  id: 'test',
  capabilities: { chat: false, embeddings: false, tools: false, vision: false },
  isAvailable: async () => false,
  // eslint-disable-next-line require-yield
  async *chat() {
    throw new Error('offline');
  },
};

function buildApp(checks: ReadinessCheck[] = [], registry = new ModuleRegistry()): Express {
  const logger = createLogger({ serviceName: 'core-test', level: 'silent' });
  const healthService = new HealthService({
    serviceName: 'core-test',
    version: '0.0.0-test',
    checks,
  });
  const kai = new KaiOrchestrator({
    provider: offlineProvider,
    logger,
    context: () => ({
      now: new Date('2026-07-14T20:30:00'),
      system: { version: '0.0.0-test', startedAt: Date.now() - 60_000 },
      modules: registry.list().map((m) => ({
        id: m.manifest.id,
        name: m.manifest.name,
        keywords: [m.manifest.name.toLowerCase()],
      })),
    }),
  });
  return createApp({ logger, healthService, moduleRegistry: registry, kai });
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

  it('POST /api/v1/kai/message répond à une capacité locale (heure)', async () => {
    const res = await request(app)
      .post('/api/v1/kai/message')
      .send({ message: 'Quelle heure est-il ?' });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('capability');
    expect(res.body.text).toMatch(/il est/i);
  });

  it('POST /api/v1/kai/message rejette une requête vide (400)', async () => {
    const res = await request(app).post('/api/v1/kai/message').send({ message: '' });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/kai/message : sans modèle joignable, repli honnête', async () => {
    const res = await request(app)
      .post('/api/v1/kai/message')
      .send({ message: 'Raconte-moi une histoire' });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('fallback');
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
