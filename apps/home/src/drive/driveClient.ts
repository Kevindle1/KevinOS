import type { DriveItem, DrivePreview, DocKind } from '@kevinos/shared';
import {
  mockList,
  mockSearch,
  mockRecent,
  mockLargest,
  mockFavorites,
  mockTrash,
  mockPreview,
  mockRename,
  mockMove,
  mockFavorite,
  mockRemove,
} from './mock.js';

/**
 * Client **KOS Drive** — Home ne connaît que le **contrat** (`/api/v1/drive*` du
 * Core), jamais le moteur (système de fichiers, Nextcloud). Vrai contenu quand
 * un Core répond ; sinon repli mock (Preview) **mutable** pour que renommer /
 * déplacer / mettre en favori restent démontrables. **Même patron que
 * `mediaClient`.**
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

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  if (backend === false) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
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

export interface DriveListResult {
  items: DriveItem[];
  live: boolean;
}

export async function listDrive(folderId?: string): Promise<DriveListResult> {
  const items = await getJson<DriveItem[]>(`/api/v1/drive${folderId ? `?folder=${folderId}` : ''}`);
  return items ? { items, live: true } : { items: mockList(folderId), live: false };
}

export async function searchDrive(text?: string, docKind?: DocKind): Promise<DriveListResult> {
  const params = new URLSearchParams();
  if (text) params.set('q', text);
  if (docKind) params.set('type', docKind);
  params.set('content', '1');
  const items = await getJson<DriveItem[]>(`/api/v1/drive/search?${params.toString()}`);
  return items ? { items, live: true } : { items: mockSearch(text, docKind), live: false };
}

export async function recentDrive(): Promise<DriveListResult> {
  const items = await getJson<DriveItem[]>('/api/v1/drive/recent');
  return items ? { items, live: true } : { items: mockRecent(), live: false };
}
export async function largestDrive(): Promise<DriveListResult> {
  const items = await getJson<DriveItem[]>('/api/v1/drive/largest');
  return items ? { items, live: true } : { items: mockLargest(), live: false };
}
export async function favoritesDrive(): Promise<DriveListResult> {
  const items = await getJson<DriveItem[]>('/api/v1/drive/favorites');
  return items ? { items, live: true } : { items: mockFavorites(), live: false };
}
export async function trashDrive(): Promise<DriveListResult> {
  const items = await getJson<DriveItem[]>('/api/v1/drive/trash');
  return items ? { items, live: true } : { items: mockTrash(), live: false };
}

export async function previewDrive(id: string): Promise<DrivePreview> {
  return (await getJson<DrivePreview>(`/api/v1/drive/${id}/preview`)) ?? mockPreview(id);
}

/** Dossiers de la racine (cibles de l'action « déplacer »). */
export async function foldersDrive(): Promise<DriveItem[]> {
  const { items } = await listDrive();
  return items.filter((i) => i.kind === 'folder');
}

/** URL de téléchargement (route Core ; le client ne joint jamais le moteur). */
export function downloadUrl(id: string): string {
  return `/api/v1/drive/${id}/raw?download=1`;
}

export async function renameDrive(id: string, name: string): Promise<DriveItem | null> {
  return (
    (await postJson<DriveItem>(`/api/v1/drive/${id}/rename`, { name })) ?? mockRename(id, name)
  );
}
export async function moveDrive(
  id: string,
  targetFolderId: string | null,
): Promise<DriveItem | null> {
  return (
    (await postJson<DriveItem>(`/api/v1/drive/${id}/move`, { targetFolderId })) ??
    mockMove(id, targetFolderId)
  );
}
export async function favoriteDrive(id: string, favorite: boolean): Promise<DriveItem | null> {
  return (
    (await postJson<DriveItem>(`/api/v1/drive/${id}/favorite`, { favorite })) ??
    mockFavorite(id, favorite)
  );
}
export async function removeDrive(id: string): Promise<boolean> {
  if (backend !== false) {
    try {
      const res = await fetch(`/api/v1/drive/${id}`, { method: 'DELETE' });
      if (res.ok) {
        backend = true;
        return true;
      }
      backend = false;
    } catch {
      backend = false;
    }
  }
  mockRemove(id);
  return true;
}
