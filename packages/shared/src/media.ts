import type { ToolDefinition } from './ai-provider.js';

/**
 * Contrat du domaine « média » — KOS Media (ADR-0005 / ADR-0012), **calqué sur
 * `PhotoLibrary`** (KOS Vision). Types **agnostiques du moteur** : aucun détail
 * de Jellyfin. KAI, Home, mobile et l'API publique ne connaissent que ce contrat
 * (Règle 3). Remplacer Jellyfin = réécrire l'adaptateur, pas ce fichier.
 */

export type MediaKind = 'movie' | 'series';

/** Progression de lecture (reprise). */
export interface PlaybackProgress {
  positionSec: number;
  durationSec: number;
  /** ISO 8601 — dernière lecture. */
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  year: number | null;
  /** Affiche, servie par le Core (jamais l'URL du moteur). */
  posterUrl: string;
  overview: string | null;
  genres: string[];
  runtimeMin: number | null;
  favorite: boolean;
}

export interface Episode {
  id: string;
  seriesId: string;
  season: number;
  episode: number;
  title: string;
  overview: string | null;
  runtimeMin: number | null;
  progress: PlaybackProgress | null;
}

export interface Season {
  season: number;
  episodes: Episode[];
}

export interface MovieDetail {
  media: MediaItem;
  progress: PlaybackProgress | null;
}

export interface SeriesDetail {
  media: MediaItem;
  seasons: Season[];
}

export interface Collection {
  id: string;
  title: string;
  itemCount: number;
  posterUrl: string | null;
}

/** Élément « Continuer la lecture » : le média + l'épisode éventuel + la reprise. */
export interface ContinueItem {
  media: MediaItem;
  episode: Episode | null;
  progress: PlaybackProgress;
}

/**
 * Port `MediaLibrary` : l'interface stable qu'implémente tout moteur média.
 * Adaptateur V1 : `JellyfinMediaAdapter implements MediaLibrary`.
 */
export interface MediaLibrary {
  /** Le moteur est-il joignable ? (readiness / mode dégradé). */
  isAvailable(signal?: AbortSignal): Promise<boolean>;

  /** Reprendre la lecture (films + épisodes en cours). */
  continueWatching(signal?: AbortSignal): Promise<ContinueItem[]>;

  /** Récemment ajoutés. */
  recentlyAdded(signal?: AbortSignal): Promise<MediaItem[]>;

  /** Bibliothèque (filtrable par type). */
  browse(kind?: MediaKind, signal?: AbortSignal): Promise<MediaItem[]>;

  /** Recherche par titre / description. */
  search(text: string, signal?: AbortSignal): Promise<MediaItem[]>;

  getMovie(id: string, signal?: AbortSignal): Promise<MovieDetail>;
  getSeries(id: string, signal?: AbortSignal): Promise<SeriesDetail>;

  listCollections(signal?: AbortSignal): Promise<Collection[]>;
  favorites(signal?: AbortSignal): Promise<MediaItem[]>;
  history(signal?: AbortSignal): Promise<MediaItem[]>;
}

/**
 * Outils exposés à KAI (KOS Brain) pour piloter KOS Media en langage naturel.
 * KAI choisit l'outil ; le Core l'exécute via le port ci-dessus. KAI ne parle
 * JAMAIS à Jellyfin directement (Règle 5).
 */
export const mediaTools: ToolDefinition[] = [
  {
    name: 'media.continue',
    description: 'Reprendre la lecture en cours (« continue mon film »).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'media.browse',
    description: 'Parcourir la bibliothèque (films ou séries).',
    parameters: {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['movie', 'series'] } },
    },
  },
  {
    name: 'media.search',
    description: 'Rechercher un film ou une série par titre.',
    parameters: {
      type: 'object',
      required: ['text'],
      properties: { text: { type: 'string', description: 'Ex. « Inception ».' } },
    },
  },
  {
    name: 'media.collections',
    description: 'Lister les collections.',
    parameters: { type: 'object', properties: {} },
  },
];
