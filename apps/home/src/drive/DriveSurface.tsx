import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchInput, Spinner, Badge, Select, DocumentPreview, documentIcon } from '@kevinos/ui';
import type { KaiDriveQuery, DriveItem, DrivePreview } from '@kevinos/shared';
import { KaiPresence } from '../kai/KaiPresence.js';
import {
  listDrive,
  searchDrive,
  recentDrive,
  largestDrive,
  favoritesDrive,
  previewDrive,
  foldersDrive,
  renameDrive,
  moveDrive,
  favoriteDrive,
  removeDrive,
  downloadUrl,
  type DriveListResult,
} from './driveClient.js';

function formatBytes(n: number | null): string {
  if (n == null) return '';
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** Une ligne de document / dossier. */
function ItemRow({ item, onOpen }: { item: DriveItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition duration-fast ease-out hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
    >
      <span aria-hidden="true" className="text-xl">
        {item.kind === 'folder' ? '📁' : documentIcon(item.docKind ?? 'other')}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm text-text">{item.name}</span>
          {item.favorite ? <span aria-label="favori">⭐</span> : null}
        </span>
        {item.excerpt ? (
          <span className="line-clamp-1 text-xs text-text-muted">{item.excerpt}</span>
        ) : (
          <span className="text-xs text-text-muted">
            {formatDate(item.modifiedAt)}
            {item.kind === 'file' ? ` · ${formatBytes(item.sizeBytes)}` : ''}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="text-text-muted">
        {item.kind === 'folder' ? '›' : ''}
      </span>
    </button>
  );
}

/**
 * 📁 **KOS Drive** — la compétence documentaire, ouverte **dans** Home. On ne
 * navigue pas dans des dossiers : KAI **retrouve une information**. Recherche,
 * récents, favoris, volumineux, aperçu **dans KevinOS** (DocumentPreview),
 * renommer / déplacer / télécharger — sans jamais quitter l'expérience. Home ne
 * connaît que le contrat (`/api/v1/drive*`) ; le moteur reste caché.
 */
export function DriveSurface({ query, onClose }: { query: KaiDriveQuery; onClose: () => void }) {
  const [items, setItems] = useState<DriveItem[] | null>(null);
  const [title, setTitle] = useState('Mes documents');
  const [live, setLive] = useState(true);
  const [text, setText] = useState(query.text ?? '');
  const [preview, setPreview] = useState<DrivePreview | null>(null);
  const [current, setCurrent] = useState<DriveItem | null>(null);
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);

  // Chargeur de la vue courante (rejoué après une mutation).
  const loader = useRef<() => Promise<DriveListResult>>(() => listDrive());

  const runLoader = useCallback(async () => {
    const res = await loader.current();
    setItems(res.items);
    setLive(res.live);
  }, []);

  const openItem = useCallback(async (item: DriveItem) => {
    if (item.kind === 'folder') {
      loader.current = () => listDrive(item.id);
      setTitle(item.name);
      setItems(null);
      const res = await listDrive(item.id);
      setItems(res.items);
      setLive(res.live);
      return;
    }
    const p = await previewDrive(item.id);
    setCurrent(item);
    setPreview(p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    setCurrent(null);
    void foldersDrive().then((f) => !cancelled && setFolders(f));

    async function boot() {
      let res: DriveListResult;
      switch (query.kind) {
        case 'find':
        case 'search':
          loader.current = () => searchDrive(query.text, query.docKind);
          setTitle(query.text ? `« ${query.text} »` : 'Résultats');
          res = await loader.current();
          if (query.kind === 'find' && res.items[0]) {
            if (cancelled) return;
            setItems(res.items);
            setLive(res.live);
            void openItem(res.items[0]);
            return;
          }
          break;
        case 'recent':
          loader.current = () => recentDrive();
          setTitle('Documents récents');
          res = await loader.current();
          break;
        case 'largest':
          loader.current = () => largestDrive();
          setTitle('Fichiers les plus volumineux');
          res = await loader.current();
          break;
        case 'favorites':
          loader.current = () => favoritesDrive();
          setTitle('Favoris');
          res = await loader.current();
          break;
        default:
          loader.current = () => listDrive();
          setTitle('Mes documents');
          res = await loader.current();
      }
      if (cancelled) return;
      setItems(res.items);
      setLive(res.live);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [query, openItem]);

  const onSearch = useCallback((t: string) => {
    const q = t.trim();
    if (!q) return;
    loader.current = () => searchDrive(q);
    setTitle(`« ${q} »`);
    setPreview(null);
    setCurrent(null);
    setItems(null);
    void searchDrive(q).then((res) => {
      setItems(res.items);
      setLive(res.live);
    });
  }, []);

  async function toggleFavorite() {
    if (!current) return;
    const updated = await favoriteDrive(current.id, !current.favorite);
    if (updated) setCurrent(updated);
    void runLoader();
  }
  async function commitRename(name: string) {
    if (!current || !name.trim()) return setRenaming(null);
    const updated = await renameDrive(current.id, name.trim());
    if (updated) {
      setCurrent(updated);
      setPreview((p) => (p ? { ...p, name: updated.name } : p));
    }
    setRenaming(null);
    void runLoader();
  }
  async function onMove(targetId: string) {
    if (!current || !targetId) return;
    await moveDrive(current.id, targetId === 'root' ? null : targetId);
    setPreview(null);
    setCurrent(null);
    void runLoader();
  }
  async function onTrash() {
    if (!current) return;
    await removeDrive(current.id);
    setPreview(null);
    setCurrent(null);
    void runLoader();
  }

  const header = (
    <div className="flex shrink-0 flex-col gap-3 pb-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2.5 py-1.5 text-sm text-text-muted transition duration-fast ease-out hover:bg-hover hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
        >
          <span aria-hidden="true">←</span> Accueil
        </button>
        <span className="flex items-center gap-2 font-medium text-text">
          <KaiPresence size="sm" /> Documents
        </span>
        {!live ? <Badge tone="accent">démo</Badge> : null}
      </div>
      <SearchInput
        value={text}
        onValueChange={setText}
        onSearch={onSearch}
        placeholder="Retrouve un document : bail, facture EDF, CV…"
      />
    </div>
  );

  // — Aperçu d'un document (on reste dans KevinOS). —
  if (preview && current) {
    return (
      <div className="animate-fade flex min-h-0 flex-1 flex-col">
        {header}
        <div className="flex shrink-0 flex-wrap items-center gap-2 pb-3">
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setCurrent(null);
            }}
            className="rounded-full px-2.5 py-1.5 text-sm text-text-muted transition duration-fast ease-out hover:bg-hover hover:text-text focus-visible:outline-none"
          >
            <span aria-hidden="true">←</span> Documents
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            className="rounded-md px-2.5 py-1.5 text-sm text-text-muted hover:bg-hover hover:text-text focus-visible:outline-none"
          >
            {current.favorite ? '⭐ Favori' : '☆ Favori'}
          </button>
          <button
            type="button"
            onClick={() => setRenaming(current.name)}
            className="rounded-md px-2.5 py-1.5 text-sm text-text-muted hover:bg-hover hover:text-text focus-visible:outline-none"
          >
            ✏️ Renommer
          </button>
          <div className="w-40">
            <Select
              aria-label="Déplacer vers"
              value=""
              onValueChange={onMove}
              options={[
                { value: '', label: 'Déplacer vers…' },
                { value: 'root', label: 'Racine' },
                ...folders
                  .filter((f) => f.id !== current.parentId)
                  .map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          </div>
          <button
            type="button"
            onClick={onTrash}
            className="rounded-md px-2.5 py-1.5 text-sm text-text-muted hover:bg-hover hover:text-text focus-visible:outline-none"
          >
            🗑️ Corbeille
          </button>
        </div>
        {renaming !== null ? (
          <form
            className="flex shrink-0 gap-2 pb-3"
            onSubmit={(e) => {
              e.preventDefault();
              void commitRename(renaming);
            }}
          >
            <input
              autoFocus
              value={renaming}
              onChange={(e) => setRenaming(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:shadow-focus focus-visible:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#fff]"
            >
              Renommer
            </button>
          </form>
        ) : null}
        <DocumentPreview
          name={preview.name}
          kind={preview.docKind}
          mode={preview.mode}
          {...(preview.url ? { url: preview.url } : {})}
          {...(preview.text !== undefined ? { text: preview.text } : {})}
          onDownload={() => window.open(downloadUrl(current.id), '_blank')}
          className="min-h-0 flex-1"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade flex min-h-0 flex-1 flex-col">
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <h2 className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
          {title}
        </h2>
        {items === null ? (
          <div className="flex justify-center py-16 text-accent">
            <Spinner size="lg" label="Recherche de tes documents" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-text-muted">Aucun document trouvé.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} onOpen={() => void openItem(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
