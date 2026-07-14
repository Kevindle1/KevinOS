import type { PlaybackProgress } from '@kevinos/shared';

/**
 * **Progression de lecture possédée par KevinOS** (Règle 5) — jamais par le
 * moteur. Quand Kevin arrête une vidéo, KevinOS sauve immédiatement ; quand il
 * revient, KAI propose de reprendre. Interface abstraite : l'implémentation
 * (fichier JSON aujourd'hui, SQLite/Postgres demain) est un détail.
 */
export interface PlaybackStore {
  get(mediaId: string): PlaybackProgress | undefined;
  set(mediaId: string, progress: PlaybackProgress): void;
  all(): Record<string, PlaybackProgress>;
}

/** Store en mémoire (tests / mode dégradé). */
export class InMemoryPlaybackStore implements PlaybackStore {
  private readonly map = new Map<string, PlaybackProgress>();
  get(mediaId: string): PlaybackProgress | undefined {
    return this.map.get(mediaId);
  }
  set(mediaId: string, progress: PlaybackProgress): void {
    this.map.set(mediaId, progress);
  }
  all(): Record<string, PlaybackProgress> {
    return Object.fromEntries(this.map);
  }
}
