import type { PhotoItem, Album } from '@kevinos/shared';

/**
 * Photothèque **simulée** — utilisée uniquement quand aucun Core n'est joignable
 * (Preview statique). Les vraies photos arrivent du Core (contrat PhotoLibrary,
 * moteur Immich caché) via `/api/v1/photos*`. Ici, des miniatures dégradées en
 * data-URI, honnêtes (rien ne prétend être une vraie photo de Kevin).
 */
function gradientThumb(from: string, to: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs><rect width="300" height="300" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PALETTE: Array<[string, string]> = [
  ['#2FBEB4', '#5b7cfa'],
  ['#f0a35e', '#ef6f6f'],
  ['#7bd88f', '#2FBEB4'],
  ['#8b7cf0', '#c05edf'],
  ['#5b7cfa', '#7bd88f'],
  ['#ef6f6f', '#f0c35e'],
  ['#2FBEB4', '#8b7cf0'],
  ['#f0a35e', '#7bd88f'],
];

export function mockPhotos(count = 14): PhotoItem[] {
  const base = Date.UTC(2026, 6, 14, 18, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const [a, b] = PALETTE[i % PALETTE.length] as [string, string];
    return {
      id: `mock-${i}`,
      takenAt: new Date(base - i * 3_600_000).toISOString(),
      kind: 'image' as const,
      favorite: i % 5 === 0,
      thumbnailUrl: gradientThumb(a, b),
      width: 300,
      height: 300,
    };
  });
}

export function mockAlbums(): Album[] {
  return [
    { id: 'mock-a1', title: 'Été 2026', photoCount: 148, coverPhotoId: 'mock-0' },
    { id: 'mock-a2', title: 'Montagne', photoCount: 63, coverPhotoId: 'mock-3' },
    { id: 'mock-a3', title: 'Famille', photoCount: 214, coverPhotoId: 'mock-5' },
  ];
}
