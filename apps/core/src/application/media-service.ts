import type {
  MediaLibrary,
  MediaItem,
  MediaKind,
  ContinueItem,
  MovieDetail,
  SeriesDetail,
  Collection,
} from '@kevinos/shared';

/**
 * Cas d'usage « média » (KOS Media). Couche application : délègue au port
 * `MediaLibrary`. Ni le moteur (Jellyfin) ni le transport HTTP n'apparaissent
 * ici — **même patron que `PhotoService`** (preuve de modularité).
 */
export class MediaService {
  constructor(private readonly library: MediaLibrary) {}

  continueWatching(): Promise<ContinueItem[]> {
    return this.library.continueWatching();
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

  getMovie(id: string): Promise<MovieDetail> {
    return this.library.getMovie(id);
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
}
