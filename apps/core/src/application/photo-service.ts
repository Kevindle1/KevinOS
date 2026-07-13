import type {
  PhotoLibrary,
  PhotoPage,
  PhotoItem,
  Album,
  AlbumDetail,
  Person,
  Memory,
  MapPoint,
  LibraryUsage,
  PhotoSearchQuery,
} from '@kevinos/shared';

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

function clampLimit(limit: number | undefined): number {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
}

/**
 * Cas d'usage « photos » (KOS Vision). Couche application : applique les valeurs
 * par défaut et les garde-fous, puis délègue au port `PhotoLibrary`. Ni le
 * moteur (Immich) ni le transport HTTP n'apparaissent ici (Clean Architecture).
 */
export class PhotoService {
  constructor(private readonly library: PhotoLibrary) {}

  browse(cursor: string | null, limit?: number): Promise<PhotoPage> {
    return this.library.browse({ cursor, limit: clampLimit(limit) });
  }

  search(query: PhotoSearchQuery): Promise<PhotoItem[]> {
    return this.library.search({ ...query, limit: clampLimit(query.limit) });
  }

  listAlbums(): Promise<Album[]> {
    return this.library.listAlbums();
  }

  getAlbum(id: string): Promise<AlbumDetail> {
    return this.library.getAlbum(id);
  }

  listPeople(): Promise<Person[]> {
    return this.library.listPeople();
  }

  getMemories(): Promise<Memory[]> {
    return this.library.getMemories();
  }

  getMapPoints(): Promise<MapPoint[]> {
    return this.library.getMapPoints();
  }

  getUsage(): Promise<LibraryUsage> {
    return this.library.getUsage();
  }
}
