import semver from 'semver';

/**
 * Versioning & compatibilité des modules (ADR-0008).
 *
 * Source unique de vérité des versions de contrat exposées par l'hôte KevinOS.
 * Le Core, le SDK et tout plugin partagent ces définitions.
 */

/** Schéma Zod-friendly : chaîne SemVer valide (ex. `1.0.0`). */
export function isSemver(value: string): boolean {
  return semver.valid(value) !== null;
}

/** Chaîne représentant une plage SemVer valide (ex. `^1.0.0`, `>=1.0.0 <2.0.0`). */
export function isSemverRange(value: string): boolean {
  return semver.validRange(value) !== null;
}

/**
 * Contrats versionnés publiés par l'hôte KevinOS.
 *
 * - `core` : version du runtime (KAI Core).
 * - `api` : version de l'API HTTP publique (`/api/v1`).
 * - `pluginInterface` : LE contrat qu'implémente tout module/plugin — c'est
 *   l'axe de compatibilité central (ADR-0008 §2).
 */
export const KEVINOS_VERSIONS = {
  core: '0.1.0',
  api: '1.0.0',
  pluginInterface: '1.0.0',
} as const;

export interface HostContract {
  /** Version du `pluginInterface` fournie par l'hôte. */
  pluginInterface: string;
  /** Version de l'API HTTP fournie par l'hôte. */
  api: string;
}

/** Contrat de l'hôte courant, dérivé de {@link KEVINOS_VERSIONS}. */
export const CURRENT_HOST: HostContract = {
  pluginInterface: KEVINOS_VERSIONS.pluginInterface,
  api: KEVINOS_VERSIONS.api,
};

/** Exigences de compatibilité déclarées par un module. */
export interface ModuleCompat {
  /**
   * Plage de versions du `pluginInterface` de l'hôte supportées par le module.
   * Ex. `^1.0.0` = « toute version 1.x » = `>=1.0.0 <2.0.0`.
   */
  pluginApi: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  /** Raisons d'incompatibilité (vide si compatible). Jamais silencieux. */
  reasons: string[];
}

/**
 * Vérifie qu'un module est compatible avec un hôte donné.
 *
 * Règle (sémantique « peerDependency », ADR-0008 §4) :
 *   compatible ⇔ semver.satisfies(host.pluginInterface, module.compat.pluginApi)
 *
 * @param compat - exigences de compatibilité du module.
 * @param host - contrat de l'hôte (par défaut l'hôte courant).
 */
export function checkCompatibility(
  compat: ModuleCompat,
  host: HostContract = CURRENT_HOST,
): CompatibilityResult {
  const reasons: string[] = [];

  if (!isSemverRange(compat.pluginApi)) {
    reasons.push(`Plage de compatibilité invalide : « ${compat.pluginApi} ».`);
  } else if (!semver.satisfies(host.pluginInterface, compat.pluginApi)) {
    reasons.push(
      `Le module requiert un Plugin Interface « ${compat.pluginApi} » ` +
        `mais l'hôte fournit « ${host.pluginInterface} ».`,
    );
  }

  return { compatible: reasons.length === 0, reasons };
}

/**
 * Plage de compatibilité par défaut recommandée pour un plugin : « même MAJEUR »
 * que le Plugin Interface courant (ex. interface `1.x` → `>=1.0.0 <2.0.0`).
 */
export function defaultPluginApiRange(host: HostContract = CURRENT_HOST): string {
  const major = semver.major(host.pluginInterface);
  return `>=${major}.0.0 <${major + 1}.0.0`;
}
