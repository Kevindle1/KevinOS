import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LocalFsDriveAdapter } from './local-fs-drive-adapter.js';
import { InMemoryDriveMetadataStore } from '../../domain/drive-metadata-store.js';

let root: string;
let adapter: LocalFsDriveAdapter;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(tmpdir(), 'kos-drive-'));
  await fs.mkdir(path.join(root, 'Maison'));
  await fs.writeFile(path.join(root, 'Maison', 'bail.pdf'), 'PDF bail location');
  await fs.writeFile(
    path.join(root, 'facture-edf.txt'),
    'Facture EDF montant 84 euros Crédit Agricole',
  );
  await fs.writeFile(path.join(root, 'cv.md'), '# Mon CV\nDéveloppeur');
  adapter = new LocalFsDriveAdapter({ root, metadata: new InMemoryDriveMetadataStore() });
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

/** Retrouve un item par nom (les ids sont opaques). */
async function byName(name: string) {
  const all = [...(await adapter.list()), ...(await adapter.list((await folder('Maison')).id))];
  const found = all.find((i) => i.name === name);
  if (!found) throw new Error(`introuvable: ${name}`);
  return found;
}
async function folder(name: string) {
  const f = (await adapter.list()).find((i) => i.name === name && i.kind === 'folder');
  if (!f) throw new Error(`dossier introuvable: ${name}`);
  return f;
}

describe('LocalFsDriveAdapter', () => {
  it('list : dossiers d’abord, ids opaques (jamais un chemin disque)', async () => {
    const items = await adapter.list();
    expect(items[0]?.kind).toBe('folder');
    expect(items.map((i) => i.name)).toContain('cv.md');
    // L'id ne doit pas ressembler à un chemin.
    expect(items[0]?.id).not.toContain('/');
    expect(items.find((i) => i.name === 'cv.md')?.docKind).toBe('markdown');
  });

  it('recherche par nom', async () => {
    const res = await adapter.search({ text: 'bail' });
    expect(res.map((i) => i.name)).toContain('bail.pdf');
  });

  it('recherche par contenu (extrait) — prépare l’OCR', async () => {
    const res = await adapter.search({ text: 'Crédit Agricole', content: true });
    const hit = res.find((i) => i.name === 'facture-edf.txt');
    expect(hit).toBeTruthy();
    expect(hit?.excerpt?.toLowerCase()).toContain('crédit agricole');
  });

  it('recherche par type (docKind pdf)', async () => {
    const res = await adapter.search({ docKind: 'pdf' });
    expect(res.every((i) => i.docKind === 'pdf')).toBe(true);
    expect(res.map((i) => i.name)).toContain('bail.pdf');
  });

  it('preview d’un fichier texte : contenu inline + URL Core (jamais le disque)', async () => {
    const cv = await byName('cv.md');
    const preview = await adapter.preview(cv.id);
    expect(preview.mode).toBe('text');
    expect(preview.text).toContain('Mon CV');
    expect(preview.url).toBe(`/api/v1/drive/${cv.id}/raw`);
    expect(preview.url).not.toContain(root);
  });

  it('renomme un document (les favoris suivent le fichier)', async () => {
    const metadata = new InMemoryDriveMetadataStore();
    adapter = new LocalFsDriveAdapter({ root, metadata });
    const cv = (await adapter.list()).find((i) => i.name === 'cv.md')!;
    await adapter.setFavorite(cv.id, true);
    const renamed = await adapter.rename(cv.id, 'cv-2026.md');
    expect(renamed.name).toBe('cv-2026.md');
    expect(renamed.favorite).toBe(true); // métadonnée migrée
    const names = (await adapter.list()).map((i) => i.name);
    expect(names).toContain('cv-2026.md');
    expect(names).not.toContain('cv.md');
  });

  it('déplace un document dans un dossier', async () => {
    const cv = (await adapter.list()).find((i) => i.name === 'cv.md')!;
    const maison = await folder('Maison');
    const moved = await adapter.move(cv.id, maison.id);
    expect(moved.parentId).toBe(maison.id);
    const inMaison = (await adapter.list(maison.id)).map((i) => i.name);
    expect(inMaison).toContain('cv.md');
  });

  it('corbeille : remove puis restore', async () => {
    const cv = (await adapter.list()).find((i) => i.name === 'cv.md')!;
    await adapter.remove(cv.id);
    expect((await adapter.list()).map((i) => i.name)).not.toContain('cv.md');
    const trashed = await adapter.trash();
    expect(trashed.map((i) => i.name)).toContain('cv.md');
    await adapter.restore(trashed[0]!.id);
    expect((await adapter.list()).map((i) => i.name)).toContain('cv.md');
  });

  it('favorites : liste les documents marqués', async () => {
    const cv = (await adapter.list()).find((i) => i.name === 'cv.md')!;
    await adapter.setFavorite(cv.id, true);
    const favs = await adapter.favorites();
    expect(favs.map((i) => i.name)).toContain('cv.md');
  });

  it('fetchRaw : sert les octets et gère le Range', async () => {
    const cv = (await adapter.list()).find((i) => i.name === 'cv.md')!;
    const full = await adapter.fetchRaw(cv.id);
    expect(full.status).toBe(200);
    expect(full.filename).toBe('cv.md');
    const partial = await adapter.fetchRaw(cv.id, 'bytes=0-3');
    expect(partial.status).toBe(206);
    expect(partial.headers['content-range']).toMatch(/^bytes 0-3\//);
  });

  it('garde anti-traversée : un id forgé hors racine échoue', async () => {
    const evil = Buffer.from('../../etc/passwd', 'utf8').toString('base64url');
    await expect(adapter.getItem(evil)).rejects.toThrow();
  });
});
