import { describe, it, expect } from 'vitest';
import { moduleManifestSchema, type HostContract } from '@kevinos/shared';
import { ModuleRegistry } from './module-registry.js';

const host: HostContract = { pluginInterface: '1.4.0', api: '1.0.0' };

function manifest(overrides: Record<string, unknown> = {}) {
  return moduleManifestSchema.parse({
    id: 'kevin-files',
    name: 'Kevin Files',
    version: '1.0.0',
    implementation: 'kevin-files-native',
    capabilities: ['files'],
    internalUrl: 'http://kevin-files:8080',
    ...overrides,
  });
}

describe('ModuleRegistry', () => {
  it('enregistre un module compatible', () => {
    const registry = new ModuleRegistry(host);
    const result = registry.register(manifest({ compat: { pluginApi: '^1.0.0' } }));

    expect(result.ok).toBe(true);
    expect(registry.size).toBe(1);
    expect(registry.has('kevin-files')).toBe(true);
    expect(registry.get('kevin-files')?.health).toBe('unknown');
  });

  it('refuse un module incompatible et ne le monte pas', () => {
    const registry = new ModuleRegistry(host);
    const result = registry.register(manifest({ compat: { pluginApi: '^2.0.0' } }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons[0]).toContain('Plugin Interface');
    }
    expect(registry.size).toBe(0);
    expect(registry.has('kevin-files')).toBe(false);
  });

  it('liste les modules montés', () => {
    const registry = new ModuleRegistry(host);
    registry.register(manifest({ id: 'kevin-files', capabilities: ['files'] }));
    registry.register(
      manifest({ id: 'kevin-photos', capabilities: ['photos'], implementation: 'immich' }),
    );

    const ids = registry.list().map((m) => m.manifest.id);
    expect(ids).toEqual(['kevin-files', 'kevin-photos']);
  });
});
