import { describe, it, expect } from 'vitest';
import { moduleManifestSchema } from './module-contract.js';

const base = {
  id: 'kevin-photos',
  name: 'Kevin Photos',
  implementation: 'immich',
  capabilities: ['photos'],
  internalUrl: 'http://immich-server:2283',
};

describe('moduleManifestSchema', () => {
  it('valide un manifeste minimal et applique les défauts', () => {
    const m = moduleManifestSchema.parse(base);
    expect(m.enabled).toBe(false); // déploiement progressif : désactivé par défaut
    expect(m.requiredAccess).toBe('member');
    expect(m.healthPath).toBe('/');
  });

  it("rejette un id qui n'est pas en kebab-case", () => {
    expect(() => moduleManifestSchema.parse({ ...base, id: 'Kevin_Photos' })).toThrow();
  });

  it('exige au moins une capacité', () => {
    expect(() => moduleManifestSchema.parse({ ...base, capabilities: [] })).toThrow();
  });

  it('rejette une URL interne invalide', () => {
    expect(() => moduleManifestSchema.parse({ ...base, internalUrl: 'pas-une-url' })).toThrow();
  });
});
