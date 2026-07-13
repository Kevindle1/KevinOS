import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createLogger, type PhotoLibrary, type PhotoItem } from '@kevinos/shared';
import { HealthService } from '../../../application/health-service.js';
import { ModuleRegistry } from '../../../application/module-registry.js';
import { PhotoService } from '../../../application/photo-service.js';
import type { PhotoThumbnails } from '../../../domain/photo-thumbnails.js';
import { createApp } from '../app.js';

const photo = (id: string): PhotoItem => ({
  id,
  takenAt: '2024-07-01T10:00:00Z',
  kind: 'image',
  favorite: false,
  thumbnailUrl: `/api/v1/photos/${id}/thumbnail`,
  width: 100,
  height: 100,
});

// Faux moteur : implémente le port, sans Immich.
const fakeLibrary: PhotoLibrary = {
  isAvailable: async () => true,
  browse: async ({ limit }) => ({
    items: [photo('a1'), photo('a2')].slice(0, limit ?? 50),
    nextCursor: '2',
  }),
  search: async ({ text }) => (text === 'plage' ? [photo('s1')] : []),
  listAlbums: async () => [{ id: 'al1', title: 'Vacances', photoCount: 2, coverPhotoId: 'a1' }],
  getAlbum: async (id) => ({
    album: { id, title: 'Vacances', photoCount: 1, coverPhotoId: 'a1' },
    photos: [photo('a1')],
  }),
  listPeople: async () => [{ id: 'p1', name: 'Fille', photoCount: 3, thumbnailUrl: null }],
  getMemories: async () => [
    { id: 'm1', title: 'Il y a 1 an', date: '2023-07-01', photos: [photo('a1')] },
  ],
  getMapPoints: async () => [{ photoId: 'a1', lat: 43.6, lng: 1.44 }],
  getUsage: async () => ({ photoCount: 1200, videoCount: 80, usedBytes: 5_000_000_000 }),
};

const fakeThumbnails: PhotoThumbnails = {
  fetchThumbnail: async () => ({
    body: new TextEncoder().encode('img').buffer,
    contentType: 'image/jpeg',
  }),
};

function buildApp(): Express {
  const logger = createLogger({ serviceName: 'core-test', level: 'silent' });
  const healthService = new HealthService({ serviceName: 'core-test', version: '0.0.0-test' });
  return createApp({
    logger,
    healthService,
    moduleRegistry: new ModuleRegistry(),
    photos: { service: new PhotoService(fakeLibrary), thumbnails: fakeThumbnails },
  });
}

describe('API v1 — /api/v1/photos (KOS Vision)', () => {
  let app: Express;
  beforeAll(() => {
    app = buildApp();
  });

  it('GET /api/v1/photos parcourt la timeline', async () => {
    const res = await request(app).get('/api/v1/photos?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].thumbnailUrl).toBe('/api/v1/photos/a1/thumbnail');
    expect(res.body.nextCursor).toBe('2');
  });

  it('GET /search exige q et renvoie les résultats', async () => {
    expect((await request(app).get('/api/v1/photos/search')).status).toBe(400);
    const res = await request(app).get('/api/v1/photos/search?q=plage');
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe('s1');
  });

  it('expose albums, personnes, souvenirs, carte et usage', async () => {
    expect((await request(app).get('/api/v1/photos/albums')).body[0].title).toBe('Vacances');
    expect((await request(app).get('/api/v1/photos/people')).body[0].name).toBe('Fille');
    expect((await request(app).get('/api/v1/photos/memories')).body[0].id).toBe('m1');
    expect((await request(app).get('/api/v1/photos/map')).body[0].lng).toBe(1.44);
    expect((await request(app).get('/api/v1/photos/usage')).body.photoCount).toBe(1200);
  });

  it('proxifie la miniature en binaire', async () => {
    const res = await request(app).get('/api/v1/photos/a1/thumbnail');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/jpeg');
  });
});
