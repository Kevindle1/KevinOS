import { describe, it, expect } from 'vitest';
import type {
  MediaLibrary,
  MediaItem,
  ContinueItem,
  MovieDetail,
  SeriesDetail,
  Collection,
  MediaStream,
} from '@kevinos/shared';
import { MediaService } from './media-service.js';
import { InMemoryPlaybackStore } from '../domain/playback-store.js';

const movie: MediaItem = { id: 'm1', kind: 'movie', title: 'Inception', posterUrl: '/p' };

/** Moteur minimal : renvoie juste ce qu'il faut pour exercer le service. */
function fakeLibrary(overrides: Partial<MediaLibrary> = {}): MediaLibrary {
  const base: MediaLibrary = {
    continueWatching: async (): Promise<ContinueItem[]> => [],
    recentlyAdded: async () => [],
    browse: async () => [],
    search: async () => [],
    getMovie: async (id): Promise<MovieDetail> => ({ media: { ...movie, id }, progress: null }),
    getSeries: async (id): Promise<SeriesDetail> => ({
      media: { id, kind: 'series', title: 'S', posterUrl: '/p' },
      seasons: [],
      nextEpisode: null,
      episodeCount: 0,
      watchedCount: 0,
      remainingMin: null,
    }),
    listCollections: async (): Promise<Collection[]> => [],
    favorites: async () => [],
    history: async () => [],
    getStream: async (id): Promise<MediaStream> => ({
      url: `/api/v1/media/${id}/stream`,
      mimeType: 'video/mp4',
      subtitles: [],
      audioTracks: [],
    }),
    isAvailable: async () => true,
  };
  return { ...base, ...overrides };
}

describe('MediaService — la reprise appartient à KevinOS', () => {
  it('saveProgress puis getStream : reprend à la position possédée par KevinOS', async () => {
    const service = new MediaService(fakeLibrary(), new InMemoryPlaybackStore());
    service.saveProgress('m1', 1234.6, 6000);

    const stream = await service.getStream('m1');
    expect(stream.startAtSec).toBe(1235); // arrondi, possédé par le store
  });

  it('getMovie superpose la progression KevinOS au détail du moteur', async () => {
    const service = new MediaService(fakeLibrary(), new InMemoryPlaybackStore());
    service.saveProgress('m1', 600, 6000);

    const detail = await service.getMovie('m1');
    expect(detail.progress?.positionSec).toBe(600);
  });

  it('saveProgress horodate la sauvegarde (updatedAt)', () => {
    const service = new MediaService(fakeLibrary(), new InMemoryPlaybackStore());
    const p = service.saveProgress('m1', 42, 6000);
    expect(p.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('continueWatching : une reprise connue de KevinOS seul apparaît (moteur muet)', async () => {
    const store = new InMemoryPlaybackStore();
    const service = new MediaService(fakeLibrary(), store);
    service.saveProgress('m1', 600, 6000);

    const cont = await service.continueWatching();
    expect(cont.map((c) => c.media.id)).toContain('m1');
    expect(cont[0]?.progress.positionSec).toBe(600);
  });

  it('continueWatching : la progression KevinOS prime sur celle du moteur', async () => {
    const engine: ContinueItem[] = [
      {
        media: movie,
        episode: null,
        progress: { positionSec: 100, durationSec: 6000, updatedAt: '2026-07-13T00:00:00Z' },
      },
    ];
    const service = new MediaService(
      fakeLibrary({ continueWatching: async () => engine }),
      new InMemoryPlaybackStore(),
    );
    service.saveProgress('m1', 4000, 6000);

    const cont = await service.continueWatching();
    expect(cont[0]?.progress.positionSec).toBe(4000); // KevinOS, pas le moteur
  });

  it('continueWatching : un film quasi terminé (≥95 %) ne réapparaît pas', async () => {
    const service = new MediaService(fakeLibrary(), new InMemoryPlaybackStore());
    service.saveProgress('m1', 5900, 6000); // 98 %

    const cont = await service.continueWatching();
    expect(cont.map((c) => c.media.id)).not.toContain('m1');
  });
});
