import { describe, it, expect } from 'vitest';
import { moduleManifestSchema } from './module-contract.js';

const base = {
  id: 'kevin-photos',
  name: 'Kevin Photos',
  version: '1.0.0',
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
    // compat.pluginApi par défaut = « même MAJEUR » que l'interface courante.
    expect(m.compat.pluginApi).toBe('>=1.0.0 <2.0.0');
  });

  it('exige une version SemVer valide', () => {
    expect(() => moduleManifestSchema.parse({ ...base, version: 'v1' })).toThrow();
    expect(() => moduleManifestSchema.parse({ ...base, version: undefined })).toThrow();
  });

  it('rejette une plage de compatibilité invalide', () => {
    expect(() =>
      moduleManifestSchema.parse({ ...base, compat: { pluginApi: 'n-importe-quoi' } }),
    ).toThrow();
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
