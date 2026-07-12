import {
  type ModuleManifest,
  type RegisteredModule,
  type HostContract,
  CURRENT_HOST,
  checkCompatibility,
} from '@kevinos/shared';

/** Résultat d'un enregistrement de module (jamais d'échec silencieux). */
export type RegisterResult =
  { ok: true; module: RegisteredModule } | { ok: false; reasons: string[] };

/**
 * Registre de services du Core (ADR-0005 + ADR-0008).
 *
 * Point d'entrée unique par lequel un module se déclare. La **garde de
 * compatibilité** est appliquée ici : un module dont la plage de compatibilité
 * n'inclut pas le `pluginInterface` de l'hôte est **refusé** — il n'est pas
 * monté, et la raison est renvoyée à l'appelant (qui la journalisera). Le reste
 * du système continue de fonctionner (mode dégradé, ENF-13).
 */
export class ModuleRegistry {
  private readonly modules = new Map<string, RegisteredModule>();
  private readonly host: HostContract;

  constructor(host: HostContract = CURRENT_HOST) {
    this.host = host;
  }

  /**
   * Enregistre un module après validation de compatibilité.
   * @returns `{ ok: true }` si monté, sinon `{ ok: false, reasons }`.
   */
  register(manifest: ModuleManifest): RegisterResult {
    const compat = checkCompatibility(manifest.compat, this.host);
    if (!compat.compatible) {
      return { ok: false, reasons: compat.reasons };
    }

    const module: RegisteredModule = {
      manifest,
      health: 'unknown',
      lastCheckedAt: null,
    };
    this.modules.set(manifest.id, module);
    return { ok: true, module };
  }

  list(): RegisteredModule[] {
    return [...this.modules.values()];
  }

  get(id: string): RegisteredModule | undefined {
    return this.modules.get(id);
  }

  has(id: string): boolean {
    return this.modules.has(id);
  }

  get size(): number {
    return this.modules.size;
  }
}
