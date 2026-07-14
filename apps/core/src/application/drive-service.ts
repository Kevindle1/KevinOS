import type {
  DriveLibrary,
  DriveItem,
  DrivePreview,
  DriveSearchQuery,
  DriveHistoryEntry,
} from '@kevinos/shared';

/**
 * Cas d'usage « documents » (KOS Drive). Délègue au port `DriveLibrary` — ni le
 * système de fichiers, ni Nextcloud, ni le transport HTTP n'apparaissent ici
 * (même patron que `PhotoService` / `MediaService`). C'est la frontière
 * applicative : les routes dépendent de ce service, jamais de l'adaptateur.
 */
export class DriveService {
  constructor(private readonly library: DriveLibrary) {}

  list(folderId?: string): Promise<DriveItem[]> {
    return this.library.list(folderId);
  }
  getItem(id: string): Promise<DriveItem> {
    return this.library.getItem(id);
  }
  search(query: DriveSearchQuery): Promise<DriveItem[]> {
    return this.library.search(query);
  }
  recent(limit?: number): Promise<DriveItem[]> {
    return this.library.recent(limit);
  }
  largest(limit?: number): Promise<DriveItem[]> {
    return this.library.largest(limit);
  }
  favorites(): Promise<DriveItem[]> {
    return this.library.favorites();
  }
  shared(): Promise<DriveItem[]> {
    return this.library.shared();
  }
  trash(): Promise<DriveItem[]> {
    return this.library.trash();
  }
  preview(id: string): Promise<DrivePreview> {
    return this.library.preview(id);
  }
  createFolder(parentId: string | null, name: string): Promise<DriveItem> {
    return this.library.createFolder(parentId, name);
  }
  rename(id: string, name: string): Promise<DriveItem> {
    return this.library.rename(id, name);
  }
  move(id: string, targetFolderId: string | null): Promise<DriveItem> {
    return this.library.move(id, targetFolderId);
  }
  copy(id: string, targetFolderId: string | null): Promise<DriveItem> {
    return this.library.copy(id, targetFolderId);
  }
  remove(id: string): Promise<void> {
    return this.library.remove(id);
  }
  restore(id: string): Promise<DriveItem> {
    return this.library.restore(id);
  }
  setFavorite(id: string, favorite: boolean): Promise<DriveItem> {
    return this.library.setFavorite(id, favorite);
  }
  setTags(id: string, tags: string[]): Promise<DriveItem> {
    return this.library.setTags(id, tags);
  }
  history(id: string): Promise<DriveHistoryEntry[]> {
    return this.library.history(id);
  }
}
