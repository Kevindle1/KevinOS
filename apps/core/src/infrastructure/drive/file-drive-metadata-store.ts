import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DriveMeta, DriveMetadataStore } from '../../domain/drive-metadata-store.js';

/**
 * Métadonnées documentaires (favoris, étiquettes, corbeille) persistées dans un
 * **fichier JSON appartenant à KevinOS** (offline-first, aucune dépendance —
 * Règle 8). L'interface `DriveMetadataStore` permet de passer à SQLite/Postgres
 * plus tard sans rien changer d'autre. **Même patron que `FilePlaybackStore`.**
 */
export class FileDriveMetadataStore implements DriveMetadataStore {
  private data: Record<string, DriveMeta>;

  constructor(private readonly filePath: string) {
    this.data = this.load();
  }

  private load(): Record<string, DriveMeta> {
    try {
      return JSON.parse(readFileSync(this.filePath, 'utf8')) as Record<string, DriveMeta>;
    } catch {
      return {};
    }
  }

  private persist(): void {
    try {
      mkdirSync(dirname(this.filePath), { recursive: true });
      writeFileSync(this.filePath, JSON.stringify(this.data), 'utf8');
    } catch {
      /* disque indisponible : on garde au moins en mémoire */
    }
  }

  get(id: string): DriveMeta | undefined {
    return this.data[id];
  }

  merge(id: string, patch: DriveMeta): DriveMeta {
    const next = { ...this.data[id], ...patch };
    this.data[id] = next;
    this.persist();
    return next;
  }

  rename(oldId: string, newId: string): void {
    const meta = this.data[oldId];
    if (!meta) return;
    delete this.data[oldId];
    this.data[newId] = meta;
    this.persist();
  }

  delete(id: string): void {
    delete this.data[id];
    this.persist();
  }

  all(): Record<string, DriveMeta> {
    return { ...this.data };
  }
}
