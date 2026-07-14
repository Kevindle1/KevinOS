import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { PlaybackProgress } from '@kevinos/shared';
import type { PlaybackStore } from '../../domain/playback-store.js';

/**
 * Progression persistée dans un simple **fichier JSON** appartenant à KevinOS
 * (offline-first, aucune dépendance). On ne réinvente pas SQLite (Règle 8) pour
 * une petite table clé→progression ; l'interface `PlaybackStore` permet de
 * basculer vers SQLite/Postgres plus tard sans rien changer d'autre.
 */
export class FilePlaybackStore implements PlaybackStore {
  private data: Record<string, PlaybackProgress>;

  constructor(private readonly filePath: string) {
    this.data = this.load();
  }

  private load(): Record<string, PlaybackProgress> {
    try {
      return JSON.parse(readFileSync(this.filePath, 'utf8')) as Record<string, PlaybackProgress>;
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

  get(mediaId: string): PlaybackProgress | undefined {
    return this.data[mediaId];
  }

  set(mediaId: string, progress: PlaybackProgress): void {
    this.data[mediaId] = progress;
    this.persist();
  }

  all(): Record<string, PlaybackProgress> {
    return { ...this.data };
  }
}
