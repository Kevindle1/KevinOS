import { describe, it, expect } from 'vitest';
import {
  KEVINOS_VERSIONS,
  checkCompatibility,
  defaultPluginApiRange,
  isSemver,
  isSemverRange,
  type HostContract,
} from './versioning.js';

describe('helpers SemVer', () => {
  it('valide les versions', () => {
    expect(isSemver('1.0.0')).toBe(true);
    expect(isSemver('1.2')).toBe(false);
    expect(isSemver('latest')).toBe(false);
  });

  it('valide les plages', () => {
    expect(isSemverRange('^1.0.0')).toBe(true);
    expect(isSemverRange('>=1.0.0 <2.0.0')).toBe(true);
    expect(isSemverRange('pas-une-plage!')).toBe(false);
  });
});

describe('checkCompatibility', () => {
  const host: HostContract = { pluginInterface: '1.4.0', api: '1.0.0' };

  it("accepte un plugin ^1.0.0 sur un hôte 1.4.0 (cas de l'exemple)", () => {
    const res = checkCompatibility({ pluginApi: '^1.0.0' }, host);
    expect(res.compatible).toBe(true);
    expect(res.reasons).toHaveLength(0);
  });

  it('accepte la plage explicite >=1.0.0 <2.0.0', () => {
    expect(checkCompatibility({ pluginApi: '>=1.0.0 <2.0.0' }, host).compatible).toBe(true);
  });

  it('refuse un plugin ^2.0.0 sur un hôte 1.4.0, avec raison explicite', () => {
    const res = checkCompatibility({ pluginApi: '^2.0.0' }, host);
    expect(res.compatible).toBe(false);
    expect(res.reasons[0]).toContain('Plugin Interface');
  });

  it('refuse une plage syntaxiquement invalide', () => {
    const res = checkCompatibility({ pluginApi: 'n-importe-quoi' }, host);
    expect(res.compatible).toBe(false);
    expect(res.reasons[0]).toContain('invalide');
  });

  it("utilise l'hôte courant par défaut", () => {
    const res = checkCompatibility({ pluginApi: `^${KEVINOS_VERSIONS.pluginInterface}` });
    expect(res.compatible).toBe(true);
  });
});

describe('defaultPluginApiRange', () => {
  it("produit une plage « même MAJEUR » pour l'interface courante", () => {
    const range = defaultPluginApiRange({ pluginInterface: '1.2.3', api: '1.0.0' });
    expect(range).toBe('>=1.0.0 <2.0.0');
  });

  it("suit le MAJEUR de l'hôte", () => {
    expect(defaultPluginApiRange({ pluginInterface: '2.5.0', api: '1.0.0' })).toBe(
      '>=2.0.0 <3.0.0',
    );
  });
});
