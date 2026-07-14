import type {
  MediaLibrary,
  MediaItem,
  MediaKind,
  ContinueItem,
  MovieDetail,
  SeriesDetail,
  Collection,
  MediaStream,
  PlaybackProgress,
} from '@kevinos/shared';
import type { PlaybackStore } from '../domain/playback-store.js';

/**
 * Cas d'usage « média » (KOS Media). Délègue au port `MediaLibrary` **et** croise
 * la **progression possédée par KevinOS** (`PlaybackStore`) : c'est KevinOS qui
 * sait où Kevin s'est arrêté, pas le moteur. Ni Jellyfin ni le transport HTTP
 * n'apparaissent ici (même patron que `PhotoService`).
 */
export class MediaService {
  constructor(
    private readonly library: MediaLibrary,
    private readonly store: PlaybackStore,
  ) {}

  async continueWatching(): Promise<ContinueItem[]> {
    const engine = await this.library.continueWatching().catch(() => []);
    const byId = new Map<string, ContinueItem>();
    for (const item of engine) {
      byId.set(item.media.id, {
        ...item,
        progress: this.store.get(item.media.id) ?? item.progress,
      });
    }
    // Reprises connues de KevinOS mais pas (encore) du moteur.
    for (const [id, p] of Object.entries(this.store.all())) {
      if (byId.has(id)) continue;
      if (p.positionSec <= 5 || (p.durationSec > 0 && p.positionSec / p.durationSec >= 0.95))
        continue;
      const detail = await this.library.getMovie(id).catch(() => null);
      if (detail) byId.set(id, { media: detail.media, episode: null, progress: p });
    }
    return [...byId.values()].sort((a, b) =>
      (b.progress.updatedAt ?? '').localeCompare(a.progress.updatedAt ?? ''),
    );
  }

  recentlyAdded(): Promise<MediaItem[]> {
    return this.library.recentlyAdded();
  }

  browse(kind?: MediaKind): Promise<MediaItem[]> {
    return this.library.browse(kind);
  }

  search(text: string): Promise<MediaItem[]> {
    return this.library.search(text);
  }

  async getMovie(id: string): Promise<MovieDetail> {
    const detail = await this.library.getMovie(id);
    const stored = this.store.get(id);
    return stored ? { ...detail, progress: stored } : detail;
  }

  getSeries(id: string): Promise<SeriesDetail> {
    return this.library.getSeries(id);
  }

  listCollections(): Promise<Collection[]> {
    return this.library.listCollections();
  }

  favorites(): Promise<MediaItem[]> {
    return this.library.favorites();
  }

  history(): Promise<MediaItem[]> {
    return this.library.history();
  }

  /** Flux de lecture — la reprise vient de **KevinOS** (pas du moteur). */
  async getStream(id: string): Promise<MediaStream> {
    const stream = await this.library.getStream(id);
    const stored = this.store.get(id);
    return stored ? { ...stream, startAtSec: stored.positionSec } : stream;
  }

  /** Sauvegarde immédiate de la progression — **possédée par KevinOS**. */
  saveProgress(id: string, positionSec: number, durationSec: number): PlaybackProgress {
    const progress: PlaybackProgress = {
      positionSec: Math.max(0, Math.round(positionSec)),
      durationSec: Math.max(0, Math.round(durationSec)),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, progress);
    return progress;
  }
}
