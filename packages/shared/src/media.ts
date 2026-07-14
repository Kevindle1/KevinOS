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

/** Piste de sous-titres (servie par le Core, jamais par le moteur). */
export interface SubtitleTrack {
  id: string;
  lang: string;
  label: string;
  url: string;
}

/** Piste audio sélectionnable. */
export interface AudioTrack {
  id: string;
  lang: string;
  label: string;
}

/**
 * Flux de lecture — **agnostique du moteur**. L'URL pointe vers le **Core**
 * (`/api/v1/media/:id/stream`), qui proxifie Jellyfin : le lecteur KevinOS ne
 * connaît jamais le moteur. `startAtSec` = reprise, **possédée par KevinOS**.
 */
export interface MediaStream {
  url: string;
  mimeType: string;
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  startAtSec: number;
}

export type RatingSource = 'tmdb' | 'imdb' | 'rotten' | 'metacritic';
export interface Rating {
  source: RatingSource;
  /** Ex. « 8.8 », « 87 % ». */
  score: string;
}
export interface CastMember {
  name: string;
  role: string | null;
}

/**
 * Enrichissement d'une fiche (facultatif) — affiche HD, bande-annonce, notes,
 * casting, similaires… Rempli par le moteur et/ou un enrichisseur (TMDB) ; **le
 * lecteur et Home restent agnostiques**.
 */
export interface MediaEnrichment {
  backdropUrl?: string;
  trailerUrl?: string;
  tagline?: string;
  ratings?: Rating[];
  director?: string;
  cast?: CastMember[];
  country?: string;
  awards?: string;
  similar?: MediaItem[];
}

export interface MovieDetail {
  media: MediaItem;
  progress: PlaybackProgress | null;
  enrichment?: MediaEnrichment;
}

export interface SeriesDetail {
  media: MediaItem;
  seasons: Season[];
  /** Épisode à reprendre / prochain à voir. */
  nextEpisode: Episode | null;
  episodeCount: number;
  watchedCount: number;
  /** Minutes restantes pour terminer la série. */
  remainingMin: number | null;
  enrichment?: MediaEnrichment;
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

  /** Flux de lecture (URL Core-proxifiée + pistes). Jamais l'URL du moteur. */
  getStream(id: string, signal?: AbortSignal): Promise<MediaStream>;

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
