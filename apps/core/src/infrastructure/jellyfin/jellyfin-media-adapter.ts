import type {
  MediaLibrary,
  MediaItem,
  MediaKind,
  ContinueItem,
  Episode,
  Season,
  MovieDetail,
  SeriesDetail,
  Collection,
  PlaybackProgress,
  MediaStream,
} from '@kevinos/shared';
import type { MediaImages } from '../../domain/media-images.js';
import type { MediaStreaming } from '../../domain/media-streaming.js';

/** Fonction `fetch` (injectable pour les tests). */
export type FetchFn = typeof fetch;

export interface JellyfinAdapterOptions {
  /** URL de base Jellyfin, ex. `http://kos-media-server:8096`. */
  baseUrl: string;
  /** Clé d'API Jellyfin (secret). */
  apiKey: string;
  /** Utilisateur ciblé (sinon : le premier utilisateur du serveur). */
  userId?: string;
  fetch?: FetchFn;
}

const TICKS_PER_SEC = 10_000_000;

/** Forme minimale d'un item Jellyfin (on ne dépend que du nécessaire). */
interface JfItem {
  Id: string;
  Name?: string;
  Type?: string;
  ProductionYear?: number | null;
  Overview?: string | null;
  Genres?: string[];
  RunTimeTicks?: number | null;
  IndexNumber?: number;
  ParentIndexNumber?: number;
  SeriesId?: string;
  ChildCount?: number;
  UserData?: {
    IsFavorite?: boolean;
    PlaybackPositionTicks?: number;
    LastPlayedDate?: string;
    Played?: boolean;
  };
}

/**
 * Adaptateur **Jellyfin** du port `MediaLibrary` (ADR-0005 / ADR-0012). SEUL
 * endroit du code qui connaît Jellyfin. Il traduit l'API Jellyfin vers les DTO
 * agnostiques de KevinOS ; les affiches pointent vers le **Core**
 * (`/api/v1/media/:id/poster`), jamais vers Jellyfin. Remplacer Jellyfin =
 * remplacer CE fichier — KAI, Home et le reste ne bougent pas.
 */
export class JellyfinMediaAdapter implements MediaLibrary, MediaImages, MediaStreaming {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchFn: FetchFn;
  private userId: string | undefined;

  constructor(options: JellyfinAdapterOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.userId = options.userId;
    this.fetchFn = options.fetch ?? fetch;
  }

  private async request<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await this.fetchFn(`${this.baseUrl}${path}`, {
      headers: { 'X-Emby-Token': this.apiKey, accept: 'application/json' },
      ...(signal ? { signal } : {}),
    });
    if (!res.ok) throw new Error(`Jellyfin GET ${path} → ${res.status}`);
    return (await res.json()) as T;
  }

  private async user(signal?: AbortSignal): Promise<string> {
    if (this.userId) return this.userId;
    const users = await this.request<Array<{ Id: string }>>('/Users', signal);
    const id = users[0]?.Id;
    if (!id) throw new Error('Jellyfin: aucun utilisateur');
    this.userId = id;
    return id;
  }

  private toMedia(item: JfItem): MediaItem {
    return {
      id: item.Id,
      kind: item.Type === 'Series' ? 'series' : 'movie',
      title: item.Name ?? 'Sans titre',
      year: item.ProductionYear ?? null,
      posterUrl: `/api/v1/media/${item.Id}/poster`,
      overview: item.Overview ?? null,
      genres: item.Genres ?? [],
      runtimeMin: item.RunTimeTicks ? Math.round(item.RunTimeTicks / (TICKS_PER_SEC * 60)) : null,
      favorite: item.UserData?.IsFavorite ?? false,
    };
  }

  private toProgress(item: JfItem): PlaybackProgress | null {
    const pos = item.UserData?.PlaybackPositionTicks ?? 0;
    if (pos <= 0 || !item.RunTimeTicks) return null;
    return {
      positionSec: Math.round(pos / TICKS_PER_SEC),
      durationSec: Math.round(item.RunTimeTicks / TICKS_PER_SEC),
      updatedAt: item.UserData?.LastPlayedDate ?? new Date().toISOString(),
    };
  }

  private toEpisode(item: JfItem): Episode {
    return {
      id: item.Id,
      seriesId: item.SeriesId ?? '',
      season: item.ParentIndexNumber ?? 0,
      episode: item.IndexNumber ?? 0,
      title: item.Name ?? '',
      overview: item.Overview ?? null,
      runtimeMin: item.RunTimeTicks ? Math.round(item.RunTimeTicks / (TICKS_PER_SEC * 60)) : null,
      progress: this.toProgress(item),
    };
  }

  async isAvailable(signal?: AbortSignal): Promise<boolean> {
    try {
      await this.request<{ Version?: string }>('/System/Info/Public', signal);
      return true;
    } catch {
      return false;
    }
  }

  async continueWatching(signal?: AbortSignal): Promise<ContinueItem[]> {
    const uid = await this.user(signal);
    const data = await this.request<{ Items?: JfItem[] }>(
      `/Users/${uid}/Items/Resume?Limit=20&MediaTypes=Video&Recursive=true`,
      signal,
    );
    return (data.Items ?? []).map((item) => {
      const progress = this.toProgress(item) ?? {
        positionSec: 0,
        durationSec: 0,
        updatedAt: new Date().toISOString(),
      };
      const isEpisode = item.Type === 'Episode';
      return {
        media: this.toMedia(
          isEpisode ? { ...item, Type: 'Series', Id: item.SeriesId ?? item.Id } : item,
        ),
        episode: isEpisode ? this.toEpisode(item) : null,
        progress,
      };
    });
  }

  async recentlyAdded(signal?: AbortSignal): Promise<MediaItem[]> {
    const uid = await this.user(signal);
    const items = await this.request<JfItem[]>(
      `/Users/${uid}/Items/Latest?Limit=20&IncludeItemTypes=Movie,Series`,
      signal,
    );
    return items.map((i) => this.toMedia(i));
  }

  async browse(kind?: MediaKind, signal?: AbortSignal): Promise<MediaItem[]> {
    const uid = await this.user(signal);
    const types = kind === 'series' ? 'Series' : kind === 'movie' ? 'Movie' : 'Movie,Series';
    const data = await this.request<{ Items?: JfItem[] }>(
      `/Users/${uid}/Items?IncludeItemTypes=${types}&Recursive=true&SortBy=SortName&Limit=100`,
      signal,
    );
    return (data.Items ?? []).map((i) => this.toMedia(i));
  }

  async search(text: string, signal?: AbortSignal): Promise<MediaItem[]> {
    const uid = await this.user(signal);
    const data = await this.request<{ Items?: JfItem[] }>(
      `/Users/${uid}/Items?SearchTerm=${encodeURIComponent(text)}&IncludeItemTypes=Movie,Series&Recursive=true&Limit=50`,
      signal,
    );
    return (data.Items ?? []).map((i) => this.toMedia(i));
  }

  async getMovie(id: string, signal?: AbortSignal): Promise<MovieDetail> {
    const uid = await this.user(signal);
    const item = await this.request<JfItem>(`/Users/${uid}/Items/${id}`, signal);
    return { media: this.toMedia(item), progress: this.toProgress(item) };
  }

  async getSeries(id: string, signal?: AbortSignal): Promise<SeriesDetail> {
    const uid = await this.user(signal);
    const item = await this.request<JfItem>(`/Users/${uid}/Items/${id}`, signal);
    const eps = await this.request<{ Items?: JfItem[] }>(
      `/Shows/${id}/Episodes?userId=${uid}`,
      signal,
    );
    const bySeason = new Map<number, Episode[]>();
    for (const raw of eps.Items ?? []) {
      const episode = this.toEpisode(raw);
      const list = bySeason.get(episode.season) ?? [];
      list.push(episode);
      bySeason.set(episode.season, list);
    }
    const seasons: Season[] = [...bySeason.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([season, episodes]) => ({ season, episodes }));

    const all = seasons.flatMap((s) => s.episodes);
    const watched = (e: Episode) =>
      !!e.progress &&
      e.progress.durationSec > 0 &&
      e.progress.positionSec / e.progress.durationSec >= 0.9;
    const watchedCount = all.filter(watched).length;
    const nextEpisode = all.find((e) => !watched(e)) ?? null;
    const remainingMin = all
      .filter((e) => !watched(e))
      .reduce((sum, e) => sum + (e.runtimeMin ?? 0), 0);

    return {
      media: this.toMedia(item),
      seasons,
      nextEpisode,
      episodeCount: all.length,
      watchedCount,
      remainingMin: remainingMin || null,
    };
  }

  async listCollections(signal?: AbortSignal): Promise<Collection[]> {
    const uid = await this.user(signal);
    const data = await this.request<{ Items?: JfItem[] }>(
      `/Users/${uid}/Items?IncludeItemTypes=BoxSet&Recursive=true&Limit=100`,
      signal,
    );
    return (data.Items ?? []).map((i) => ({
      id: i.Id,
      title: i.Name ?? 'Collection',
      itemCount: i.ChildCount ?? 0,
      posterUrl: `/api/v1/media/${i.Id}/poster`,
    }));
  }

  async favorites(signal?: AbortSignal): Promise<MediaItem[]> {
    const uid = await this.user(signal);
    const data = await this.request<{ Items?: JfItem[] }>(
      `/Users/${uid}/Items?Filters=IsFavorite&IncludeItemTypes=Movie,Series&Recursive=true&Limit=100`,
      signal,
    );
    return (data.Items ?? []).map((i) => this.toMedia(i));
  }

  async history(signal?: AbortSignal): Promise<MediaItem[]> {
    const uid = await this.user(signal);
    const data = await this.request<{ Items?: JfItem[] }>(
      `/Users/${uid}/Items?Filters=IsPlayed&SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Movie,Series&Recursive=true&Limit=50`,
      signal,
    );
    return (data.Items ?? []).map((i) => this.toMedia(i));
  }

  async getStream(id: string, signal?: AbortSignal): Promise<MediaStream> {
    // Le lecteur reçoit une URL **du Core**, jamais de Jellyfin. Les pistes
    // sous-titres/audio détaillées (MediaStreams) sont une étape suivante ; le
    // contrat les prévoit déjà.
    void signal;
    return {
      url: `/api/v1/media/${id}/stream`,
      mimeType: 'video/mp4',
      subtitles: [],
      audioTracks: [],
      startAtSec: 0,
    };
  }

  /** Proxifie le flux Jellyfin (Range) — le client ne joint jamais le moteur. */
  async fetchStream(
    itemId: string,
    range: string | undefined,
    signal?: AbortSignal,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    body: ReadableStream<Uint8Array> | null;
  }> {
    const res = await this.fetchFn(
      `${this.baseUrl}/Videos/${encodeURIComponent(itemId)}/stream?static=true&api_key=${encodeURIComponent(this.apiKey)}`,
      { headers: range ? { Range: range } : {}, ...(signal ? { signal } : {}) },
    );
    const headers: Record<string, string> = {};
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      const v = res.headers.get(h);
      if (v) headers[h] = v;
    }
    return {
      status: res.status,
      headers,
      body: res.body as ReadableStream<Uint8Array> | null,
    };
  }

  async fetchPoster(
    itemId: string,
    signal?: AbortSignal,
  ): Promise<{ body: ArrayBuffer; contentType: string }> {
    const res = await this.fetchFn(
      `${this.baseUrl}/Items/${encodeURIComponent(itemId)}/Images/Primary?maxWidth=400&api_key=${encodeURIComponent(this.apiKey)}`,
      { ...(signal ? { signal } : {}) },
    );
    if (!res.ok) throw new Error(`Jellyfin poster ${itemId} → ${res.status}`);
    return {
      body: await res.arrayBuffer(),
      contentType: res.headers.get('content-type') ?? 'image/jpeg',
    };
  }
}
