import type { PhotoItem, PhotoPage, Album } from '@kevinos/shared';
import { mockPhotos, mockAlbums } from './mock.js';

/**
 * Client **KOS Vision** — Home ne connaît que le **contrat** (`/api/v1/photos*`
 * du Core), jamais Immich. Quand un Core répond, ce sont **tes vraies photos** ;
 * sinon (Preview statique), on retombe sur une photothèque simulée. `live`
 * indique la source, pour rester honnête à l'écran.
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

export interface PhotoResult {
  items: PhotoItem[];
  /** true = vraies photos du Core ; false = démonstration simulée. */
  live: boolean;
}

export async function loadTimeline(): Promise<PhotoResult> {
  const page = await getJson<PhotoPage>('/api/v1/photos');
  return page ? { items: page.items, live: true } : { items: mockPhotos(), live: false };
}

export async function loadSearch(text: string): Promise<PhotoResult> {
  const items = await getJson<PhotoItem[]>(`/api/v1/photos/search?q=${encodeURIComponent(text)}`);
  return items ? { items, live: true } : { items: mockPhotos(), live: false };
}

export async function loadAlbums(): Promise<Album[]> {
  const albums = await getJson<Album[]>('/api/v1/photos/albums');
  return albums ?? mockAlbums();
}
