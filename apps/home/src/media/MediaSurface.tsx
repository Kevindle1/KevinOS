import { useEffect, useState } from 'react';
import { SearchInput, Spinner, Badge } from '@kevinos/ui';
import type {
  KaiMediaQuery,
  MediaItem,
  ContinueItem,
  Collection,
  PlaybackProgress,
} from '@kevinos/shared';
import { KaiPresence } from '../kai/KaiPresence.js';
import {
  loadContinue,
  loadRecent,
  loadLibrary,
  searchMedia,
  loadCollections,
} from './mediaClient.js';
import { MediaDetail, type DetailRef, type PlayTarget } from './MediaDetail.js';

function pct(p: PlaybackProgress | null | undefined): number {
  if (!p || !p.durationSec) return 0;
  return Math.min(100, Math.round((p.positionSec / p.durationSec) * 100));
}

function PosterCard({
  item,
  progress,
  onOpen,
  className,
}: {
  item: MediaItem;
  progress?: PlaybackProgress | null;
  onOpen: () => void;
  className?: string;
}) {
  const p = pct(progress);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex flex-col gap-1.5 text-left focus-visible:outline-none ${className ?? ''}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-hover">
        <img
          src={item.posterUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-base ease-out group-hover:scale-[1.04] group-focus-visible:shadow-focus"
        />
        {p > 0 ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[rgba(0,0,0,0.45)]">
            <div className="h-full bg-accent" style={{ width: `${p}%` }} />
          </div>
        ) : null}
      </div>
      <span className="truncate text-sm text-text">{item.title}</span>
    </button>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">{children}</div>
    </section>
  );
}

/**
 * 🎬 **KOS Media** — la compétence Media, ouverte **dans** Home. KAI t'y amène ;
 * tu retrouves ta lecture, ta bibliothèque, une fiche immersive, et le lecteur
 * officiel KevinOS. Home ne connaît que le contrat (`/api/v1/media*`).
 */
export function MediaSurface({
  query,
  onClose,
  onPlay,
  onSuggest,
}: {
  query: KaiMediaQuery;
  onClose: () => void;
  onPlay: (target: PlayTarget) => void;
  onSuggest: (prompt: string) => void;
}) {
  const [cont, setCont] = useState<ContinueItem[]>([]);
  const [recent, setRecent] = useState<MediaItem[]>([]);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [live, setLive] = useState(true);
  const [text, setText] = useState(query.kind === 'search' ? (query.text ?? '') : '');
  const [detail, setDetail] = useState<DetailRef | null>(null);
  const [directDetail, setDirectDetail] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const c = await loadContinue();
      if (cancelled) return;
      setCont(c.items);
      if (query.kind === 'continue' && c.items[0]) {
        setDirectDetail(true);
        setDetail({ kind: c.items[0].media.kind, id: c.items[0].media.id });
        return;
      }
      const kind = query.kind === 'series' ? 'series' : 'movie';
      const lib =
        query.kind === 'search' && query.text
          ? await searchMedia(query.text)
          : await loadLibrary(kind);
      if (cancelled) return;
      setItems(lib.items);
      setLive(c.live && lib.live);
      void loadRecent().then((r) => !cancelled && setRecent(r.items));
      void loadCollections().then((cols) => !cancelled && setCollections(cols));
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (detail) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MediaDetail
          detail={detail}
          onBack={() => (directDetail ? onClose() : setDetail(null))}
          onOpen={(ref) => {
            setDirectDetail(false);
            setDetail(ref);
          }}
          onPlay={onPlay}
          onSuggest={onSuggest}
        />
      </div>
    );
  }

  const gridTitle =
    query.kind === 'series' ? 'Séries' : query.kind === 'search' ? `« ${query.text} »` : 'Films';

  return (
    <div className="animate-fade flex min-h-0 flex-1 flex-col">
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
            <KaiPresence size="sm" /> Média
          </span>
          {!live ? <Badge tone="accent">démo</Badge> : null}
        </div>
        <SearchInput
          value={text}
          onValueChange={setText}
          onSearch={(t) =>
            t.trim() ? searchMedia(t.trim()).then((r) => setItems(r.items)) : undefined
          }
          placeholder="Rechercher un film, une série…"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-4">
        {cont.length > 0 ? (
          <Row title="Continuer la lecture">
            {cont.map((c) => (
              <PosterCard
                key={c.media.id}
                item={c.media}
                progress={c.progress}
                onOpen={() => setDetail({ kind: c.media.kind, id: c.media.id })}
                className="w-28 shrink-0"
              />
            ))}
          </Row>
        ) : null}

        {recent.length > 0 ? (
          <Row title="Récemment ajoutés">
            {recent.map((m) => (
              <PosterCard
                key={m.id}
                item={m}
                onOpen={() => setDetail({ kind: m.kind, id: m.id })}
                className="w-28 shrink-0"
              />
            ))}
          </Row>
        ) : null}

        {items === null ? (
          <div className="flex justify-center py-16 text-accent">
            <Spinner size="lg" label="Chargement de la médiathèque" />
          </div>
        ) : (
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {gridTitle}
            </h2>
            {items.length === 0 ? (
              <p className="py-8 text-center text-text-muted">Rien trouvé.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {items.map((m) => (
                  <PosterCard
                    key={m.id}
                    item={m}
                    onOpen={() => setDetail({ kind: m.kind, id: m.id })}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {collections.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Collections
            </h2>
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => (
                <span
                  key={c.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  {c.title} <span className="text-text-muted">· {c.itemCount}</span>
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
