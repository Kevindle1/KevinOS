import { describe, it, expect, vi } from 'vitest';
import { JellyfinMediaAdapter } from './jellyfin-media-adapter.js';

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => data, headers: new Headers() } as unknown as Response;
}

function makeAdapter(fetchImpl: ReturnType<typeof vi.fn>) {
  return new JellyfinMediaAdapter({
    baseUrl: 'http://jellyfin:8096',
    apiKey: 'secret-key',
    userId: 'u1',
    fetch: fetchImpl as unknown as typeof fetch,
  });
}

describe('JellyfinMediaAdapter', () => {
  it('envoie le token et transforme un film en DTO agnostique', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        Items: [
          {
            Id: 'm1',
            Type: 'Movie',
            Name: 'Inception',
            ProductionYear: 2010,
            Genres: ['Sci-Fi'],
            RunTimeTicks: 60 * 60 * 10_000_000, // 60 min
            UserData: { IsFavorite: true },
          },
        ],
      }),
    );
    const items = await makeAdapter(fetchImpl).browse('movie');

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('/Users/u1/Items?IncludeItemTypes=Movie');
    expect((init.headers as Record<string, string>)['X-Emby-Token']).toBe('secret-key');

    expect(items[0]).toMatchObject({
      id: 'm1',
      kind: 'movie',
      title: 'Inception',
      year: 2010,
      posterUrl: '/api/v1/media/m1/poster', // route Core, jamais Jellyfin
      runtimeMin: 60,
      favorite: true,
    });
  });

  it('reprise : convertit les ticks en progression (secondes)', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        Items: [
          {
            Id: 'm2',
            Type: 'Movie',
            Name: 'Dune',
            RunTimeTicks: 6000 * 10_000_000, // 6000 s
            UserData: {
              PlaybackPositionTicks: 3600 * 10_000_000,
              LastPlayedDate: '2026-07-13T22:00:00Z',
            },
          },
        ],
      }),
    );
    const cont = await makeAdapter(fetchImpl).continueWatching();
    expect(cont[0]?.media.title).toBe('Dune');
    expect(cont[0]?.episode).toBeNull();
    expect(cont[0]?.progress).toMatchObject({ positionSec: 3600, durationSec: 6000 });
  });

  it('recherche par titre', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ Items: [{ Id: 's1', Type: 'Series', Name: 'The Last of Us' }] }),
    );
    const results = await makeAdapter(fetchImpl).search('last of us');
    const [url] = fetchImpl.mock.calls[0];
    expect(url).toContain('SearchTerm=last%20of%20us');
    expect(results[0]).toMatchObject({ id: 's1', kind: 'series', title: 'The Last of Us' });
  });

  it('isAvailable renvoie false si le moteur répond en erreur', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, false, 502));
    expect(await makeAdapter(fetchImpl).isAvailable()).toBe(false);
  });
});
