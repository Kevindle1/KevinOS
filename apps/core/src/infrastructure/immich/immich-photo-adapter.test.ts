import { describe, it, expect, vi } from 'vitest';
import { ImmichPhotoAdapter } from './immich-photo-adapter.js';

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => data,
    headers: new Headers(),
  } as unknown as Response;
}

function makeAdapter(fetchImpl: ReturnType<typeof vi.fn>) {
  return new ImmichPhotoAdapter({
    baseUrl: 'http://immich:2283/api',
    apiKey: 'secret-key',
    fetch: fetchImpl as unknown as typeof fetch,
  });
}

describe('ImmichPhotoAdapter', () => {
  it('envoie la clé API et transforme les assets en DTO agnostiques', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        assets: {
          nextPage: 2,
          items: [
            {
              id: 'a1',
              type: 'IMAGE',
              fileCreatedAt: '2024-07-01T10:00:00Z',
              isFavorite: true,
              exifInfo: { exifImageWidth: 4000, exifImageHeight: 3000 },
            },
          ],
        },
      }),
    );
    const page = await makeAdapter(fetchImpl).browse({ limit: 10 });

    // Requête : bon endpoint + clé API.
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://immich:2283/api/search/metadata');
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('secret-key');

    // Transformation : aucune fuite Immich, URL de miniature = route Core.
    expect(page.items[0]).toMatchObject({
      id: 'a1',
      kind: 'image',
      favorite: true,
      thumbnailUrl: '/api/v1/photos/a1/thumbnail',
      width: 4000,
      height: 3000,
    });
    expect(page.nextCursor).toBe('2');
  });

  it('mappe la recherche « intelligente » et les vidéos', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ assets: { items: [{ id: 'v1', type: 'VIDEO' }] } }),
    );
    const results = await makeAdapter(fetchImpl).search({ text: 'plage 2024' });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://immich:2283/api/search/smart');
    expect(JSON.parse(init.body as string)).toMatchObject({ query: 'plage 2024' });
    expect(results[0]).toMatchObject({ id: 'v1', kind: 'video' });
  });

  it('convertit lon → lng pour la carte', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([{ id: 'p1', lat: 43.6, lon: 1.44 }]));
    const points = await makeAdapter(fetchImpl).getMapPoints();
    expect(points[0]).toEqual({ photoId: 'p1', lat: 43.6, lng: 1.44 });
  });

  it("expose l'usage (espace occupé)", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ photos: 1200, videos: 80, usage: 5_000_000_000 }),
    );
    const usage = await makeAdapter(fetchImpl).getUsage();
    expect(usage).toEqual({ photoCount: 1200, videoCount: 80, usedBytes: 5_000_000_000 });
  });

  it('isAvailable renvoie false si le moteur répond en erreur', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, false, 502));
    expect(await makeAdapter(fetchImpl).isAvailable()).toBe(false);
  });
});
