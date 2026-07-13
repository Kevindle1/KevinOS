import type {
  PhotoLibrary,
  PhotoItem,
  PhotoPage,
  Album,
  AlbumDetail,
  Person,
  Memory,
  MapPoint,
  LibraryUsage,
  BrowseParams,
  PhotoSearchQuery,
  PhotoKind,
} from '@kevinos/shared';

/** Fonction `fetch` (injectable pour les tests). */
export type FetchFn = typeof fetch;

export interface ImmichAdapterOptions {
  /** URL de base de l'API Immich, ex. `http://kos-vision-server:2283/api`. */
  baseUrl: string;
  /** Clé d'API Immich (secret). */
  apiKey: string;
  fetch?: FetchFn;
}

/** Forme minimale d'un asset Immich (on ne dépend que de ce dont on a besoin). */
interface ImmichAsset {
  id: string;
  type?: string;
  fileCreatedAt?: string;
  localDateTime?: string;
  isFavorite?: boolean;
  exifInfo?: { exifImageWidth?: number | null; exifImageHeight?: number | null } | null;
}

/**
 * Adaptateur Immich du port `PhotoLibrary` (ADR-0005 / ADR-0012).
 *
 * SEUL endroit du code qui connaît Immich. Il traduit l'API Immich vers les DTO
 * agnostiques de KevinOS. Les URLs de miniatures pointent vers le **Core**
 * (`/api/v1/photos/:id/thumbnail`), jamais vers Immich : l'utilisateur et le
 * Dashboard ignorent le moteur. Remplacer Immich = remplacer CE fichier.
 */
export class ImmichPhotoAdapter implements PhotoLibrary {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchFn: FetchFn;

  constructor(options: ImmichAdapterOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.fetchFn = options.fetch ?? fetch;
  }

  private async request<T>(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      accept: 'application/json',
    };
    if (init.body) headers['content-type'] = 'application/json';

    const res = await this.fetchFn(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
      ...(signal ? { signal } : {}),
    });
    if (!res.ok) {
      throw new Error(`Immich ${init.method ?? 'GET'} ${path} → ${res.status}`);
    }
    return (await res.json()) as T;
  }

  private toPhoto(a: ImmichAsset): PhotoItem {
    const kind: PhotoKind = (a.type ?? '').toUpperCase() === 'VIDEO' ? 'video' : 'image';
    return {
      id: a.id,
      takenAt: a.fileCreatedAt ?? a.localDateTime ?? null,
      kind,
      favorite: a.isFavorite ?? false,
      thumbnailUrl: `/api/v1/photos/${a.id}/thumbnail`,
      width: a.exifInfo?.exifImageWidth ?? null,
      height: a.exifInfo?.exifImageHeight ?? null,
    };
  }

  async isAvailable(signal?: AbortSignal): Promise<boolean> {
    try {
      const res = await this.request<{ res?: string }>('/server/ping', {}, signal);
      return res.res === 'pong';
    } catch {
      return false;
    }
  }

  async browse(params: BrowseParams, signal?: AbortSignal): Promise<PhotoPage> {
    const size = params.limit ?? 50;
    const page = params.cursor ? Number(params.cursor) : 1;
    const body = JSON.stringify({ page, size, order: 'desc' });
    const data = await this.request<{
      assets?: { items?: ImmichAsset[]; nextPage?: string | number | null };
    }>('/search/metadata', { method: 'POST', body }, signal);

    const items = (data.assets?.items ?? []).map((a) => this.toPhoto(a));
    const next = data.assets?.nextPage;
    return { items, nextCursor: next != null ? String(next) : null };
  }

  async search(query: PhotoSearchQuery, signal?: AbortSignal): Promise<PhotoItem[]> {
    const size = query.limit ?? 50;
    // Recherche « intelligente » (sémantique) quand un texte est fourni.
    const body: Record<string, unknown> = { query: query.text, size };
    if (query.personIds?.length) body.personIds = query.personIds;
    if (query.from) body.takenAfter = query.from;
    if (query.to) body.takenBefore = query.to;

    const data = await this.request<{ assets?: { items?: ImmichAsset[] } }>(
      '/search/smart',
      { method: 'POST', body: JSON.stringify(body) },
      signal,
    );
    return (data.assets?.items ?? []).map((a) => this.toPhoto(a));
  }

  async listAlbums(signal?: AbortSignal): Promise<Album[]> {
    const albums = await this.request<
      Array<{
        id: string;
        albumName?: string;
        assetCount?: number;
        albumThumbnailAssetId?: string | null;
      }>
    >('/albums', {}, signal);
    return albums.map((al) => ({
      id: al.id,
      title: al.albumName ?? 'Album',
      photoCount: al.assetCount ?? 0,
      coverPhotoId: al.albumThumbnailAssetId ?? null,
    }));
  }

  async getAlbum(id: string, signal?: AbortSignal): Promise<AlbumDetail> {
    const al = await this.request<{
      id: string;
      albumName?: string;
      assetCount?: number;
      albumThumbnailAssetId?: string | null;
      assets?: ImmichAsset[];
    }>(`/albums/${encodeURIComponent(id)}`, {}, signal);
    const photos = (al.assets ?? []).map((a) => this.toPhoto(a));
    return {
      album: {
        id: al.id,
        title: al.albumName ?? 'Album',
        photoCount: al.assetCount ?? photos.length,
        coverPhotoId: al.albumThumbnailAssetId ?? null,
      },
      photos,
    };
  }

  async listPeople(signal?: AbortSignal): Promise<Person[]> {
    const data = await this.request<{
      people?: Array<{ id: string; name?: string; thumbnailPath?: string; assetCount?: number }>;
    }>('/people', {}, signal);
    return (data.people ?? []).map((p) => ({
      id: p.id,
      name: p.name && p.name.length > 0 ? p.name : null,
      photoCount: p.assetCount ?? 0,
      thumbnailUrl: `/api/v1/photos/people/${p.id}/thumbnail`,
    }));
  }

  async getMemories(signal?: AbortSignal): Promise<Memory[]> {
    const memories = await this.request<
      Array<{ id: string; memoryAt?: string; data?: { year?: number }; assets?: ImmichAsset[] }>
    >('/memories', {}, signal);
    return memories.map((m) => ({
      id: m.id,
      title: m.data?.year ? `Il y a ${new Date().getFullYear() - m.data.year} an(s)` : 'Souvenir',
      date: m.memoryAt ?? '',
      photos: (m.assets ?? []).map((a) => this.toPhoto(a)),
    }));
  }

  async getMapPoints(signal?: AbortSignal): Promise<MapPoint[]> {
    const markers = await this.request<Array<{ id: string; lat: number; lon: number }>>(
      '/map/markers',
      {},
      signal,
    );
    return markers.map((mk) => ({ photoId: mk.id, lat: mk.lat, lng: mk.lon }));
  }

  async getUsage(signal?: AbortSignal): Promise<LibraryUsage> {
    const stats = await this.request<{ photos?: number; videos?: number; usage?: number }>(
      '/server/statistics',
      {},
      signal,
    );
    return {
      photoCount: stats.photos ?? 0,
      videoCount: stats.videos ?? 0,
      usedBytes: stats.usage ?? 0,
    };
  }

  /**
   * Récupère les octets d'une miniature (proxifiée par le Core). Renvoie le
   * corps binaire et le type MIME, sans jamais exposer Immich au client.
   */
  async fetchThumbnail(
    assetId: string,
    signal?: AbortSignal,
  ): Promise<{ body: ArrayBuffer; contentType: string }> {
    const res = await this.fetchFn(
      `${this.baseUrl}/assets/${encodeURIComponent(assetId)}/thumbnail?size=preview`,
      { headers: { 'x-api-key': this.apiKey }, ...(signal ? { signal } : {}) },
    );
    if (!res.ok) throw new Error(`Immich thumbnail ${assetId} → ${res.status}`);
    return {
      body: await res.arrayBuffer(),
      contentType: res.headers.get('content-type') ?? 'image/jpeg',
    };
  }
}
