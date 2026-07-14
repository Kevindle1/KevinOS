import type { DriveItem, DrivePreview, DocKind, PreviewMode } from '@kevinos/shared';

/**
 * Miroirs **hors-ligne** de `docKindFromName` / `previewModeFor` (Core =
 * source de vérité). Dupliqués ici pour garder Home découplé du **runtime**
 * `@kevinos/shared` (éviter d'embarquer zod/pino), comme les parseurs d'intention.
 */
const DOC_KIND_BY_EXT: Record<string, DocKind> = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  md: 'markdown',
  markdown: 'markdown',
  txt: 'text',
  log: 'text',
  csv: 'csv',
  json: 'json',
  js: 'code',
  ts: 'code',
  html: 'code',
  css: 'code',
  yml: 'code',
  yaml: 'code',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
};
function docKindFromName(name: string): DocKind {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
  return DOC_KIND_BY_EXT[ext] ?? 'other';
}
function previewModeFor(kind: DocKind): PreviewMode {
  if (kind === 'image') return 'image';
  if (kind === 'pdf') return 'pdf';
  if (
    kind === 'text' ||
    kind === 'markdown' ||
    kind === 'csv' ||
    kind === 'json' ||
    kind === 'code'
  )
    return 'text';
  return 'download';
}

/**
 * Drive **simulé** — uniquement quand aucun Core n'est joignable (Preview). Les
 * vrais documents arrivent du Core (contrat `DriveLibrary`, moteur caché). Le
 * store est **mutable** pour que renommer / déplacer / mettre en favori restent
 * démontrables sans backend. Rien ne prétend être un vrai fichier.
 */
function svgPage(title: string, from: string, to: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560">` +
    `<rect width="420" height="560" fill="#ffffff"/>` +
    `<rect width="420" height="90" fill="${from}"/>` +
    `<rect y="90" width="420" height="6" fill="${to}"/>` +
    `<text x="28" y="55" font-family="sans-serif" font-size="26" fill="#ffffff">${title}</text>` +
    Array.from({ length: 9 }, (_, i) => {
      const w = 360 - (i % 3) * 40;
      return `<rect x="28" y="${140 + i * 34}" width="${w}" height="12" rx="6" fill="#e5e7eb"/>`;
    }).join('') +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

interface Doc {
  item: DriveItem;
  /** Contenu indexé (recherche plein-texte + aperçu texte). */
  content?: string;
  /** URL d'aperçu (image / pdf stand-in). */
  url?: string;
}

function mk(
  id: string,
  name: string,
  parentId: string | null,
  modifiedAt: string,
  sizeBytes: number | null,
  extra: Partial<DriveItem> = {},
): DriveItem {
  const kind = sizeBytes === null ? 'folder' : 'file';
  const base: DriveItem = {
    id,
    kind,
    name,
    path: `/${name}`,
    parentId,
    modifiedAt,
    sizeBytes,
    favorite: false,
    shared: false,
    trashed: false,
    tags: [],
    ...extra,
  };
  if (kind === 'file') {
    base.docKind = docKindFromName(name);
    base.mimeType = null;
  }
  return base;
}

const DOCS: Doc[] = [
  { item: mk('maison', 'Maison', null, '2026-07-10T09:00:00Z', null, { childCount: 2 }) },
  { item: mk('admin', 'Administratif', null, '2026-07-12T09:00:00Z', null, { childCount: 3 }) },
  {
    item: mk('bail', 'bail-location.md', 'maison', '2026-05-02T18:20:00Z', 4200, {
      tags: ['maison'],
    }),
    content:
      '# Bail de location\n\nLogement : 12 rue des Lilas.\nLoyer : 850 € / mois.\nDépôt de garantie : 1700 €.\nDurée : 3 ans.',
  },
  {
    item: mk('edf', 'facture-edf.txt', 'admin', '2026-07-03T08:10:00Z', 1800),
    content:
      'Facture EDF — juillet 2026\nMontant : 84,20 €\nÉchéance : 15/07/2026\nPrélèvement : Crédit Agricole\nRéférence client : 41008822',
  },
  {
    item: mk('free', 'contrat-free.pdf', 'admin', '2026-06-18T14:00:00Z', 128_400),
    url: svgPage('Contrat Free', '#2FBEB4', '#5b7cfa'),
  },
  {
    item: mk('cv', 'cv.md', null, '2026-07-13T20:30:00Z', 3100, { favorite: true }),
    content:
      '# CV — Kevin\n\nDéveloppeur produit.\nCréateur de **KevinOS**, un système personnel.\n\n## Compétences\n- Architecture logicielle\n- Design d’expérience',
  },
  {
    item: mk('budget', 'budget-2026.xlsx', 'admin', '2026-07-11T11:00:00Z', 512_000),
  },
  {
    item: mk('compteur', 'photo-compteur.png', 'maison', '2026-07-08T16:45:00Z', 240_000),
    url: svgPage('Relevé compteur', '#f0a35e', '#ef6f6f'),
  },
  {
    item: mk('notes', 'notes-kevinos.md', null, '2026-07-14T07:15:00Z', 2600, {
      tags: ['kevinos'],
    }),
    content:
      '# Notes KevinOS\n\nKevinOS doit devenir mon système d’exploitation personnel.\nChaque compétence doit être réellement utilisable au quotidien.',
  },
];

function find(id: string): Doc | undefined {
  return DOCS.find((d) => d.item.id === id);
}

export function mockList(folderId?: string): DriveItem[] {
  const parent = folderId ?? null;
  return DOCS.filter((d) => !d.item.trashed && d.item.parentId === parent)
    .map((d) => d.item)
    .sort((a, b) =>
      a.kind !== b.kind ? (a.kind === 'folder' ? -1 : 1) : a.name.localeCompare(b.name),
    );
}

export function mockSearch(text?: string, docKind?: DocKind): DriveItem[] {
  const needle = text?.toLowerCase().trim();
  return DOCS.filter((d) => d.item.kind === 'file' && !d.item.trashed)
    .filter((d) => (docKind ? d.item.docKind === docKind : true))
    .filter((d) => {
      if (!needle) return true;
      if (d.item.name.toLowerCase().includes(needle)) return true;
      return (d.content ?? '').toLowerCase().includes(needle);
    })
    .map((d) => {
      if (needle && d.content) {
        const idx = d.content.toLowerCase().indexOf(needle);
        if (idx >= 0 && !d.item.name.toLowerCase().includes(needle)) {
          const from = Math.max(0, idx - 30);
          return {
            ...d.item,
            excerpt: `…${d.content.slice(from, idx + needle.length + 30).trim()}…`,
          };
        }
      }
      return d.item;
    })
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export function mockRecent(): DriveItem[] {
  return DOCS.filter((d) => d.item.kind === 'file' && !d.item.trashed)
    .map((d) => d.item)
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}
export function mockLargest(): DriveItem[] {
  return DOCS.filter((d) => d.item.kind === 'file' && !d.item.trashed)
    .map((d) => d.item)
    .sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0));
}
export function mockFavorites(): DriveItem[] {
  return DOCS.filter((d) => d.item.favorite && !d.item.trashed).map((d) => d.item);
}
export function mockTrash(): DriveItem[] {
  return DOCS.filter((d) => d.item.trashed).map((d) => d.item);
}

export function mockPreview(id: string): DrivePreview {
  const doc = find(id);
  const name = doc?.item.name ?? 'document';
  const docKind = docKindFromName(name);
  // En Preview, image ET pdf sont rendus via une « page » SVG inline (stand-in) ;
  // avec un Core, l'aperçu réel passe par la route `/raw`.
  const mode = doc?.url ? 'image' : previewModeFor(docKind);
  const preview: DrivePreview = {
    id,
    name,
    docKind,
    mimeType: 'application/octet-stream',
    mode,
    url: doc?.url ?? `/api/v1/drive/${id}/raw`,
  };
  if (mode === 'text') preview.text = doc?.content ?? '';
  return preview;
}

export function mockRename(id: string, name: string): DriveItem | null {
  const doc = find(id);
  if (!doc) return null;
  doc.item = { ...doc.item, name, path: `/${name}`, docKind: docKindFromName(name) };
  return doc.item;
}
export function mockMove(id: string, targetFolderId: string | null): DriveItem | null {
  const doc = find(id);
  if (!doc) return null;
  doc.item = { ...doc.item, parentId: targetFolderId };
  return doc.item;
}
export function mockFavorite(id: string, favorite: boolean): DriveItem | null {
  const doc = find(id);
  if (!doc) return null;
  doc.item = { ...doc.item, favorite };
  return doc.item;
}
export function mockRemove(id: string): void {
  const doc = find(id);
  if (doc) doc.item = { ...doc.item, trashed: true };
}
