import { promises as fs, createReadStream, type Stats, type Dirent } from 'node:fs';
import path from 'node:path';
import {
  docKindFromName,
  isTextDoc,
  previewModeFor,
  type DriveLibrary,
  type DriveItem,
  type DrivePreview,
  type DriveSearchQuery,
  type DriveHistoryEntry,
} from '@kevinos/shared';
import type { DriveContent } from '../../domain/drive-content.js';
import type { DriveMetadataStore } from '../../domain/drive-metadata-store.js';

export interface LocalFsAdapterOptions {
  /** Racine documentaire (le système de fichiers est le moteur, **caché**). */
  root: string;
  /** Métadonnées possédées par KevinOS (favoris, étiquettes, corbeille). */
  metadata: DriveMetadataStore;
}

/** Dossier réservé à la corbeille (invisible dans la navigation). */
const TRASH = '.kos-trash';
/** Contenu texte lu au plus pour la recherche / l'aperçu. */
const MAX_CONTENT_BYTES = 512 * 1024;
const PREVIEW_TEXT_BYTES = 256 * 1024;
const SEARCH_LIMIT = 100;

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
  log: 'text/plain',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  json: 'application/json',
  js: 'text/javascript',
  ts: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  yml: 'text/yaml',
  yaml: 'text/yaml',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

function mimeFromName(name: string): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

/**
 * Adaptateur **système de fichiers local** du port `DriveLibrary` (ADR-0005 /
 * ADR-0012). SEUL endroit du code qui connaît le disque. Il traduit les fichiers
 * vers les DTO agnostiques de KevinOS ; les URL d'aperçu pointent vers le
 * **Core** (`/api/v1/drive/:id/raw`), jamais vers le disque. Les favoris et
 * étiquettes sont **possédés par KevinOS** (`DriveMetadataStore`), le système de
 * fichiers n'en ayant pas la notion. Remplacer ce moteur par Nextcloud =
 * remplacer CE fichier — KAI, Home et le reste ne bougent pas.
 *
 * Les identifiants sont opaques (chemin relatif encodé) : Home et KAI ne voient
 * jamais un chemin disque. Toute résolution est **bornée à la racine** (aucune
 * traversée `..` possible).
 */
export class LocalFsDriveAdapter implements DriveLibrary, DriveContent {
  private readonly root: string;
  private readonly metadata: DriveMetadataStore;

  constructor(options: LocalFsAdapterOptions) {
    this.root = path.resolve(options.root);
    this.metadata = options.metadata;
  }

  private encodeId(rel: string): string {
    return Buffer.from(rel, 'utf8').toString('base64url');
  }

  private decodeId(id: string): string {
    const rel = Buffer.from(id, 'base64url').toString('utf8');
    if (rel.includes('\0')) throw new Error('drive: identifiant invalide');
    return rel.replace(/^\/+/, '');
  }

  /** Chemin disque, **borné à la racine** (garde anti-traversée). */
  private abs(rel: string): string {
    const p = path.resolve(this.root, rel);
    if (p !== this.root && !p.startsWith(this.root + path.sep)) {
      throw new Error('drive: chemin hors racine');
    }
    return p;
  }

  private isHidden(name: string): boolean {
    return name.startsWith('.kos');
  }

  private async countChildren(rel: string): Promise<number> {
    try {
      const entries = await fs.readdir(this.abs(rel));
      return entries.filter((n) => !this.isHidden(n)).length;
    } catch {
      return 0;
    }
  }

  private async toItem(rel: string, st?: Stats): Promise<DriveItem> {
    const stat = st ?? (await fs.stat(this.abs(rel)));
    const id = this.encodeId(rel);
    const name = rel === '' ? 'Mes documents' : path.basename(rel);
    const isDir = stat.isDirectory();
    const parentRel = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
    const meta = this.metadata.get(id) ?? {};
    const item: DriveItem = {
      id,
      kind: isDir ? 'folder' : 'file',
      name,
      path: rel === '' ? '/' : `/${rel}`,
      parentId: rel === '' ? null : this.encodeId(parentRel),
      modifiedAt: stat.mtime.toISOString(),
      sizeBytes: isDir ? null : stat.size,
      favorite: meta.favorite ?? false,
      shared: false,
      trashed: rel === TRASH || rel.startsWith(`${TRASH}/`),
      tags: meta.tags ?? [],
    };
    if (isDir) {
      item.childCount = await this.countChildren(rel);
    } else {
      item.docKind = docKindFromName(name);
      item.mimeType = mimeFromName(name);
    }
    return item;
  }

  private async *walkFiles(rel: string): AsyncGenerator<{ rel: string; stat: Stats }> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(this.abs(rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (this.isHidden(e.name)) continue;
      const childRel = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        yield* this.walkFiles(childRel);
      } else if (e.isFile()) {
        try {
          yield { rel: childRel, stat: await fs.stat(this.abs(childRel)) };
        } catch {
          /* fichier disparu entre-temps : on l'ignore */
        }
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return (await fs.stat(this.root)).isDirectory();
    } catch {
      return false;
    }
  }

  async list(folderId?: string): Promise<DriveItem[]> {
    const rel = folderId ? this.decodeId(folderId) : '';
    const entries = await fs.readdir(this.abs(rel), { withFileTypes: true });
    const items = await Promise.all(
      entries
        .filter((e) => !this.isHidden(e.name))
        .map((e) => this.toItem(rel ? `${rel}/${e.name}` : e.name)),
    );
    return items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name, 'fr');
    });
  }

  getItem(id: string): Promise<DriveItem> {
    return this.toItem(this.decodeId(id));
  }

  async search(query: DriveSearchQuery): Promise<DriveItem[]> {
    const startRel = query.folderId ? this.decodeId(query.folderId) : '';
    const needle = query.text?.toLowerCase().trim();
    const results: DriveItem[] = [];

    for await (const { rel, stat } of this.walkFiles(startRel)) {
      const name = path.basename(rel);
      const dk = docKindFromName(name);
      if (query.docKind && dk !== query.docKind) continue;
      if (query.minSizeBytes != null && stat.size < query.minSizeBytes) continue;
      const iso = stat.mtime.toISOString();
      if (query.modifiedAfter && iso < query.modifiedAfter) continue;
      if (query.modifiedBefore && iso > query.modifiedBefore) continue;

      let excerpt: string | null = null;
      if (needle) {
        const inName = name.toLowerCase().includes(needle);
        let inContent = false;
        if (!inName && query.content && isTextDoc(dk) && stat.size <= MAX_CONTENT_BYTES) {
          const text = await fs.readFile(this.abs(rel), 'utf8').catch(() => '');
          const idx = text.toLowerCase().indexOf(needle);
          if (idx >= 0) {
            inContent = true;
            const from = Math.max(0, idx - 40);
            excerpt =
              (from > 0 ? '…' : '') + text.slice(from, idx + needle.length + 40).trim() + '…';
          }
        }
        if (!inName && !inContent) continue;
      }

      const item = await this.toItem(rel, stat);
      if (excerpt) item.excerpt = excerpt;
      results.push(item);
      if (results.length >= SEARCH_LIMIT * 2) break;
    }

    return results.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, SEARCH_LIMIT);
  }

  async recent(limit = 20): Promise<DriveItem[]> {
    const files: Array<{ rel: string; stat: Stats }> = [];
    for await (const f of this.walkFiles('')) files.push(f);
    files.sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
    return Promise.all(files.slice(0, limit).map((f) => this.toItem(f.rel, f.stat)));
  }

  async largest(limit = 20): Promise<DriveItem[]> {
    const files: Array<{ rel: string; stat: Stats }> = [];
    for await (const f of this.walkFiles('')) files.push(f);
    files.sort((a, b) => b.stat.size - a.stat.size);
    return Promise.all(files.slice(0, limit).map((f) => this.toItem(f.rel, f.stat)));
  }

  async favorites(): Promise<DriveItem[]> {
    const ids = Object.entries(this.metadata.all())
      .filter(([, m]) => m.favorite)
      .map(([id]) => id);
    const items = await Promise.all(ids.map((id) => this.getItem(id).catch(() => null)));
    return items.filter((i): i is DriveItem => i !== null && !i.trashed);
  }

  shared(): Promise<DriveItem[]> {
    // Partage par lien : prévu au contrat, branché avec un vrai moteur (V2).
    return Promise.resolve([]);
  }

  async trash(): Promise<DriveItem[]> {
    try {
      const entries = await fs.readdir(this.abs(TRASH), { withFileTypes: true });
      return Promise.all(entries.map((e) => this.toItem(`${TRASH}/${e.name}`)));
    } catch {
      return [];
    }
  }

  async preview(id: string): Promise<DrivePreview> {
    const rel = this.decodeId(id);
    const name = path.basename(rel);
    const docKind = docKindFromName(name);
    const mode = previewModeFor(docKind);
    const preview: DrivePreview = {
      id,
      name,
      docKind,
      mimeType: mimeFromName(name),
      mode,
      url: `/api/v1/drive/${id}/raw`,
    };
    if (mode === 'text') {
      const stat = await fs.stat(this.abs(rel));
      const text = await fs
        .readFile(this.abs(rel), 'utf8')
        .then((t) => t.slice(0, PREVIEW_TEXT_BYTES))
        .catch(() => '');
      preview.text = text;
      if (stat.size > PREVIEW_TEXT_BYTES) preview.text += '\n…';
    }
    return preview;
  }

  async createFolder(parentId: string | null, name: string): Promise<DriveItem> {
    const parentRel = parentId ? this.decodeId(parentId) : '';
    const rel = parentRel ? `${parentRel}/${this.safeName(name)}` : this.safeName(name);
    await fs.mkdir(this.abs(rel), { recursive: true });
    return this.toItem(rel);
  }

  async rename(id: string, name: string): Promise<DriveItem> {
    const rel = this.decodeId(id);
    const parentRel = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
    const newRel = parentRel ? `${parentRel}/${this.safeName(name)}` : this.safeName(name);
    await fs.rename(this.abs(rel), this.abs(newRel));
    this.metadata.rename(id, this.encodeId(newRel));
    return this.toItem(newRel);
  }

  async move(id: string, targetFolderId: string | null): Promise<DriveItem> {
    const rel = this.decodeId(id);
    const targetRel = targetFolderId ? this.decodeId(targetFolderId) : '';
    const base = path.basename(rel);
    const newRel = await this.uniqueRel(targetRel ? `${targetRel}/${base}` : base);
    await fs.rename(this.abs(rel), this.abs(newRel));
    this.metadata.rename(id, this.encodeId(newRel));
    return this.toItem(newRel);
  }

  async copy(id: string, targetFolderId: string | null): Promise<DriveItem> {
    const rel = this.decodeId(id);
    const targetRel = targetFolderId ? this.decodeId(targetFolderId) : '';
    const base = path.basename(rel);
    const newRel = await this.uniqueRel(targetRel ? `${targetRel}/${base}` : base);
    await fs.cp(this.abs(rel), this.abs(newRel), { recursive: true });
    const meta = this.metadata.get(id);
    if (meta) this.metadata.merge(this.encodeId(newRel), { ...meta, trashedFrom: null });
    return this.toItem(newRel);
  }

  async remove(id: string): Promise<void> {
    const rel = this.decodeId(id);
    if (rel === '' || rel === TRASH) throw new Error('drive: suppression non permise');
    await fs.mkdir(this.abs(TRASH), { recursive: true });
    const parentRel = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
    const dest = await this.uniqueRel(`${TRASH}/${path.basename(rel)}`);
    await fs.rename(this.abs(rel), this.abs(dest));
    const newId = this.encodeId(dest);
    this.metadata.rename(id, newId);
    this.metadata.merge(newId, { trashedFrom: parentRel ? `/${parentRel}` : '/' });
  }

  async restore(id: string): Promise<DriveItem> {
    const rel = this.decodeId(id);
    if (!rel.startsWith(`${TRASH}/`)) throw new Error('drive: item hors corbeille');
    const meta = this.metadata.get(id);
    const fromDisplay = meta?.trashedFrom ?? '/';
    const targetRel = fromDisplay === '/' ? '' : fromDisplay.replace(/^\/+/, '');
    const base = path.basename(rel);
    const newRel = await this.uniqueRel(targetRel ? `${targetRel}/${base}` : base);
    await fs.mkdir(this.abs(targetRel), { recursive: true });
    await fs.rename(this.abs(rel), this.abs(newRel));
    const newId = this.encodeId(newRel);
    this.metadata.rename(id, newId);
    this.metadata.merge(newId, { trashedFrom: null });
    return this.toItem(newRel);
  }

  async setFavorite(id: string, favorite: boolean): Promise<DriveItem> {
    this.metadata.merge(id, { favorite });
    return this.getItem(id);
  }

  async setTags(id: string, tags: string[]): Promise<DriveItem> {
    this.metadata.merge(id, { tags });
    return this.getItem(id);
  }

  history(): Promise<DriveHistoryEntry[]> {
    // Versionnement : prévu au contrat, branché avec un moteur qui le gère (V2).
    return Promise.resolve([]);
  }

  async fetchRaw(
    id: string,
    range?: string,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    filename: string;
    stream: NodeJS.ReadableStream | null;
  }> {
    const rel = this.decodeId(id);
    const filename = path.basename(rel);
    const abs = this.abs(rel);
    const stat = await fs.stat(abs);
    const type = mimeFromName(filename);
    const m = range?.match(/bytes=(\d*)-(\d*)/);

    if (m && (m[1] || m[2])) {
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Math.min(Number(m[2]), stat.size - 1) : stat.size - 1;
      if (start > end || start >= stat.size) {
        return {
          status: 416,
          headers: { 'content-range': `bytes */${stat.size}` },
          filename,
          stream: null,
        };
      }
      return {
        status: 206,
        headers: {
          'content-type': type,
          'content-length': String(end - start + 1),
          'content-range': `bytes ${start}-${end}/${stat.size}`,
          'accept-ranges': 'bytes',
        },
        filename,
        stream: createReadStream(abs, { start, end }),
      };
    }

    return {
      status: 200,
      headers: {
        'content-type': type,
        'content-length': String(stat.size),
        'accept-ranges': 'bytes',
      },
      filename,
      stream: createReadStream(abs),
    };
  }

  /** Nettoie un nom (pas de séparateur, pas de traversée). */
  private safeName(name: string): string {
    const clean = name.replace(/[/\\\0]/g, '').trim();
    if (!clean || clean === '.' || clean === '..') throw new Error('drive: nom invalide');
    return clean;
  }

  /** Évite d'écraser un existant : ajoute « (2) », « (3) »… si besoin. */
  private async uniqueRel(rel: string): Promise<string> {
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
    const base = path.basename(rel);
    const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
    const stem = ext ? base.slice(0, -ext.length) : base;
    let candidate = rel;
    let n = 2;
    for (;;) {
      try {
        await fs.access(this.abs(candidate));
      } catch {
        return candidate;
      }
      const name = `${stem} (${n})${ext}`;
      candidate = dir ? `${dir}/${name}` : name;
      n += 1;
    }
  }
}
