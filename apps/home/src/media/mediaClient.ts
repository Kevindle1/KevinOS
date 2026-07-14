import type {
  MediaItem,
  ContinueItem,
  Collection,
  MovieDetail,
  SeriesDetail,
  MediaKind,
} from '@kevinos/shared';
import {
  mockContinue,
  mockRecent,
  mockLibrary,
  mockCollections,
  mockMovie,
  mockSeries,
} from './mock.js';

/**
 * Client **KOS Media** — Home ne connaît que le **contrat** (`/api/v1/media*` du
 * Core), jamais Jellyfin. Vrai contenu quand un Core répond ; sinon repli mock
 * (Preview). `live` = source réelle. **Même patron que `photosClient`.**
 */
let backend: boolean | null = null;

async function getJson<T>(url: string): Promise<T | null> {
  if (backend === false) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      backend = false;
      return null;
    }
    backend = true;
    return (await res.json()) as T;
  } catch {
    backend = false;
    return null;
  }
}

export interface MediaListResult {
  items: MediaItem[];
  live: boolean;
}
export interface ContinueResult {
  items: ContinueItem[];
  live: boolean;
}

export async function loadContinue(): Promise<ContinueResult> {
  const items = await getJson<ContinueItem[]>('/api/v1/media/continue');
  return items ? { items, live: true } : { items: mockContinue(), live: false };
}
export async function loadRecent(): Promise<MediaListResult> {
  const items = await getJson<MediaItem[]>('/api/v1/media/recent');
  return items ? { items, live: true } : { items: mockRecent(), live: false };
}
export async function loadLibrary(kind?: MediaKind): Promise<MediaListResult> {
  const items = await getJson<MediaItem[]>(`/api/v1/media${kind ? `?kind=${kind}` : ''}`);
  return items ? { items, live: true } : { items: mockLibrary(kind), live: false };
}
export async function searchMedia(text: string): Promise<MediaListResult> {
  const items = await getJson<MediaItem[]>(`/api/v1/media/search?q=${encodeURIComponent(text)}`);
  return items ? { items, live: true } : { items: mockLibrary(), live: false };
}
export async function loadCollections(): Promise<Collection[]> {
  return (await getJson<Collection[]>('/api/v1/media/collections')) ?? mockCollections();
}
export async function loadMovie(id: string): Promise<MovieDetail> {
  return (await getJson<MovieDetail>(`/api/v1/media/movies/${id}`)) ?? mockMovie(id);
}
export async function loadSeries(id: string): Promise<SeriesDetail> {
  return (await getJson<SeriesDetail>(`/api/v1/media/series/${id}`)) ?? mockSeries(id);
}
