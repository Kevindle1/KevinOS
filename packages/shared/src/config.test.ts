import { describe, it, expect } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it("applique des valeurs par défaut saines quand rien n'est fourni", () => {
    const cfg = loadConfig({});
    expect(cfg.nodeEnv).toBe('development');
    expect(cfg.port).toBe(8080);
    expect(cfg.host).toBe('0.0.0.0');
    expect(cfg.aiProvider).toBe('local'); // 100 % local par défaut (ADR-0006)
  });

  it("coerce le port depuis une chaîne d'environnement", () => {
    const cfg = loadConfig({ KEVINOS_PORT: '9090' });
    expect(cfg.port).toBe(9090);
  });

  it('rejette un port hors bornes (fail-fast)', () => {
    expect(() => loadConfig({ KEVINOS_PORT: '70000' })).toThrow();
  });

  it('rejette un fournisseur IA inconnu', () => {
    expect(() => loadConfig({ KEVINOS_AI_PROVIDER: 'skynet' })).toThrow();
  });

  it('accepte un fournisseur externe explicitement configuré', () => {
    const cfg = loadConfig({ KEVINOS_AI_PROVIDER: 'openai' });
    expect(cfg.aiProvider).toBe('openai');
  });
});
