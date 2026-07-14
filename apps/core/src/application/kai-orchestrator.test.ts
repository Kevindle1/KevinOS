import { describe, it, expect, vi } from 'vitest';
import { createLogger, type AIProvider } from '@kevinos/shared';
import { KaiOrchestrator } from './kai-orchestrator.js';
import type { KaiContext } from '../domain/kai/capabilities.js';

const logger = createLogger({ serviceName: 'kai-test', level: 'silent' });

const context = (): KaiContext => ({
  now: new Date('2026-07-14T20:30:00'),
  system: { version: '0.0.0-test', startedAt: Date.now() - 60_000 },
  modules: [],
});

function provider(over: Partial<AIProvider>): AIProvider {
  return {
    id: 'fake',
    capabilities: { chat: true, embeddings: false, tools: false, vision: false },
    isAvailable: async () => true,
    // eslint-disable-next-line require-yield
    async *chat() {
      throw new Error('not_implemented');
    },
    ...over,
  };
}

describe('KaiOrchestrator', () => {
  it('répond via une capacité locale sans appeler le modèle', async () => {
    const chat = vi.fn();
    const kai = new KaiOrchestrator({
      provider: provider({
        // eslint-disable-next-line require-yield
        async *chat() {
          chat();
        },
      }),
      logger,
      context,
    });
    const r = await kai.handle('Quelle heure est-il ?');
    expect(r.source).toBe('capability');
    expect(chat).not.toHaveBeenCalled();
  });

  it('délègue au modèle quand aucune capacité ne correspond', async () => {
    const kai = new KaiOrchestrator({
      provider: provider({
        async *chat() {
          yield { delta: 'Salut ', done: false };
          yield { delta: 'Kevin', done: true };
        },
      }),
      logger,
      context,
    });
    const r = await kai.handle('Raconte-moi une histoire');
    expect(r.source).toBe('model');
    expect(r.text).toBe('Salut Kevin');
  });

  it('repli honnête si le modèle est injoignable', async () => {
    const kai = new KaiOrchestrator({
      provider: provider({ isAvailable: async () => false }),
      logger,
      context,
    });
    const r = await kai.handle('Raconte-moi une histoire');
    expect(r.source).toBe('fallback');
  });

  it('repli si le modèle échoue en cours de route', async () => {
    const kai = new KaiOrchestrator({
      provider: provider({
        // eslint-disable-next-line require-yield
        async *chat() {
          throw new Error('boom');
        },
      }),
      logger,
      context,
    });
    const r = await kai.handle('Raconte-moi une histoire');
    expect(r.source).toBe('fallback');
  });
});
