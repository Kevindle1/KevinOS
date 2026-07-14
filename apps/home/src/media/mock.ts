import type {
  MediaItem,
  ContinueItem,
  Collection,
  MovieDetail,
  SeriesDetail,
  MediaStream,
  MediaEnrichment,
} from '@kevinos/shared';
import { getLocalProgress } from './localProgress.js';

/** Vidéo d'exemple (démo Preview) — libre de droits, CORS ouvert. */
const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_VTT =
  'data:text/vtt,' +
  encodeURIComponent(
    'WEBVTT\n\n00:00:01.000 --> 00:00:06.000\nDémonstration KevinOS — sous-titres.\n',
  );

/**
 * Médiathèque **simulée** — uniquement quand aucun Core n'est joignable (Preview).
 * Les vrais films/séries arrivent du Core (contrat MediaLibrary, moteur Jellyfin
 * caché). Affiches dégradées, honnêtes (rien ne prétend être un vrai film).
 */
function poster(from: string, to: string, label: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="200" height="300" fill="url(#g)"/>` +
    `<text x="16" y="280" font-family="sans-serif" font-size="15" fill="#ffffff" opacity="0.9">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MOVIES: MediaItem[] = [
  {
    id: 'mv-1',
    kind: 'movie',
    title: 'Voyage stellaire',
    year: 2024,
    posterUrl: poster('#2FBEB4', '#5b7cfa', 'Voyage'),
    overview: 'Une odyssée aux confins du système solaire.',
    genres: ['Science-fiction'],
    runtimeMin: 128,
    favorite: true,
  },
  {
    id: 'mv-2',
    kind: 'movie',
    title: 'La dernière vague',
    year: 2023,
    posterUrl: poster('#f0a35e', '#ef6f6f', 'Vague'),
    overview: 'Un surfeur affronte l’océan et lui-même.',
    genres: ['Drame'],
    runtimeMin: 104,
    favorite: false,
  },
  {
    id: 'mv-3',
    kind: 'movie',
    title: 'Nuit blanche',
    year: 2022,
    posterUrl: poster('#8b7cf0', '#c05edf', 'Nuit'),
    overview: 'Une enquête en temps réel dans la ville endormie.',
    genres: ['Thriller'],
    runtimeMin: 96,
    favorite: false,
  },
  {
    id: 'mv-4',
    kind: 'movie',
    title: 'Les collines',
    year: 2021,
    posterUrl: poster('#7bd88f', '#2FBEB4', 'Collines'),
    overview: 'Trois amis, un été, une montagne.',
    genres: ['Aventure'],
    runtimeMin: 112,
    favorite: false,
  },
];

const SERIES: MediaItem[] = [
  {
    id: 'sr-1',
    kind: 'series',
    title: 'Les gardiens',
    year: 2025,
    posterUrl: poster('#5b7cfa', '#7bd88f', 'Gardiens'),
    overview: 'Ils veillent sur une cité suspendue.',
    genres: ['Fantastique'],
    runtimeMin: null,
    favorite: true,
  },
  {
    id: 'sr-2',
    kind: 'series',
    title: 'Signal',
    year: 2024,
    posterUrl: poster('#ef6f6f', '#f0c35e', 'Signal'),
    overview: 'Un message venu de nulle part.',
    genres: ['Science-fiction'],
    runtimeMin: null,
    favorite: false,
  },
];

export function mockContinue(): ContinueItem[] {
  const media = MOVIES[0] as MediaItem;
  return [
    {
      media,
      episode: null,
      progress: { positionSec: 3600, durationSec: 128 * 60, updatedAt: '2026-07-13T22:10:00Z' },
    },
  ];
}

export function mockRecent(): MediaItem[] {
  return [...MOVIES, ...SERIES];
}
export function mockLibrary(kind?: 'movie' | 'series'): MediaItem[] {
  if (kind === 'series') return SERIES;
  if (kind === 'movie') return MOVIES;
  return [...MOVIES, ...SERIES];
}
export function mockCollections(): Collection[] {
  return [
    { id: 'col-1', title: 'Soirées ciné', itemCount: 12, posterUrl: null },
    { id: 'col-2', title: 'Science-fiction', itemCount: 27, posterUrl: null },
  ];
}
function enrichmentFor(media: MediaItem): MediaEnrichment {
  return {
    tagline: 'Une expérience KevinOS.',
    ratings: [
      { source: 'tmdb', score: '8.2' },
      { source: 'imdb', score: '7.9' },
      { source: 'rotten', score: '91 %' },
    ],
    director: 'C. Réalisateur',
    cast: [
      { name: 'A. Comédienne', role: 'Elle' },
      { name: 'B. Comédien', role: 'Lui' },
      { name: 'C. Invité', role: 'Le mystère' },
    ],
    country: 'France',
    similar: [...MOVIES, ...SERIES].filter((m) => m.id !== media.id).slice(0, 4),
  };
}

export function mockMovie(id: string): MovieDetail {
  const media = [...MOVIES, ...SERIES].find((m) => m.id === id) ?? (MOVIES[0] as MediaItem);
  const cont = mockContinue()[0];
  const stored = getLocalProgress(id);
  const progress = stored ?? (media.id === cont?.media.id ? cont.progress : null);
  return { media, progress, enrichment: enrichmentFor(media) };
}

/** Flux de démo : Big Buck Bunny + une piste de sous-titres + reprise locale. */
export function mockStream(id: string): MediaStream {
  const stored = getLocalProgress(id);
  const cont = mockContinue()[0];
  return {
    url: SAMPLE_VIDEO,
    mimeType: 'video/mp4',
    subtitles: [{ id: 'fr', lang: 'fr', label: 'Français', url: SAMPLE_VTT }],
    audioTracks: [],
    startAtSec:
      stored?.positionSec ?? (id === cont?.media.id ? (cont?.progress.positionSec ?? 0) : 0),
  };
}

export function mockSeries(id: string): SeriesDetail {
  const media = SERIES.find((m) => m.id === id) ?? (SERIES[0] as MediaItem);
  const nextEpisode = {
    id: `${id}-e2`,
    seriesId: id,
    season: 1,
    episode: 2,
    title: 'La faille',
    overview: null,
    runtimeMin: 49,
    progress: null,
  };
  const seasons = [
    {
      season: 1,
      episodes: [
        {
          id: `${id}-e1`,
          seriesId: id,
          season: 1,
          episode: 1,
          title: 'Pilote',
          overview: null,
          runtimeMin: 52,
          progress: { positionSec: 1200, durationSec: 3120, updatedAt: '2026-07-12T21:00:00Z' },
        },
        nextEpisode,
      ],
    },
  ];
  return {
    media,
    seasons,
    nextEpisode,
    episodeCount: 2,
    watchedCount: 0,
    remainingMin: 101,
    enrichment: enrichmentFor(media),
  };
}
