/**
 * Accès typé aux informations de build et à l'**environnement d'exécution**.
 *
 * En **mode Preview**, KevinOS fonctionne **100 % simulé** — aucune dépendance
 * serveur (Docker, PostgreSQL, Redis, Immich, Jellyfin). Le but est de
 * **prévisualiser l'expérience** depuis une simple URL (iPhone compris).
 */
export interface BuildInfo {
  version: string;
  branch: string;
  commit: string;
  /** ISO 8601 — instant du build. */
  builtAt: string;
  /** Affiche le chrome « Preview » (écran d'accueil + badge). */
  preview: boolean;
  /** `production` · `staging` · `preview` · `local`. */
  channel: string;
}

/**
 * Source des données. Tant que le Core n'est pas branché, **tout est simulé**
 * (`mock`). Le mode Preview force toujours `mock`. À terme, staging/production
 * pourront passer à `live` sans changer l'expérience.
 */
export type DataSource = 'mock' | 'live';

export function getBuildInfo(): BuildInfo {
  return __KOS_BUILD__;
}

/** Vrai si l'on affiche l'habillage « Preview ». */
export function isPreview(): boolean {
  return __KOS_BUILD__.preview;
}

/** Aujourd'hui, toujours `mock` (aucune dépendance serveur). */
export function getDataSource(): DataSource {
  return 'mock';
}

/** Libellé lisible du canal (pour le badge). */
export function channelLabel(channel: string): string {
  switch (channel) {
    case 'production':
      return 'Production';
    case 'staging':
      return 'Staging';
    case 'preview':
      return 'Preview';
    default:
      return 'Local';
  }
}
