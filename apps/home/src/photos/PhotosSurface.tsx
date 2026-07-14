import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchInput, Lightbox, Spinner, Badge } from '@kevinos/ui';
import type { KaiPhotoQuery, PhotoItem, Album } from '@kevinos/shared';
import { KaiPresence } from '../kai/KaiPresence.js';
import { loadTimeline, loadSearch, loadAlbums, type PhotoResult } from './photosClient.js';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function caption(item: PhotoItem | undefined): string {
  if (!item?.takenAt) return '';
  return dateFmt.format(new Date(item.takenAt));
}

/**
 * 📷 **KOS Vision** — la compétence Photos, ouverte **dans** Home (pas une autre
 * app). KAI t'amène ici ; la galerie s'affiche, tu ouvres une photo, tu reviens.
 * Home ne connaît que le contrat (`/api/v1/photos*`) — jamais Immich.
 */
export function PhotosSurface({ query, onClose }: { query: KaiPhotoQuery; onClose: () => void }) {
  const [result, setResult] = useState<PhotoResult | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [opened, setOpened] = useState<number | null>(null);
  const [text, setText] = useState(query.kind === 'search' ? (query.text ?? '') : '');

  const run = useCallback(async (q: KaiPhotoQuery) => {
    setResult(null);
    const res = q.kind === 'search' && q.text ? await loadSearch(q.text) : await loadTimeline();
    setResult(res);
  }, []);

  useEffect(() => {
    void run(query);
    void loadAlbums().then(setAlbums);
  }, [query, run]);

  const items = result?.items ?? [];
  const current = opened != null ? items[opened] : undefined;
  const move = (delta: number) =>
    setOpened((o) =>
      o == null || items.length === 0 ? o : (o + delta + items.length) % items.length,
    );

  const title = useMemo(
    () => (query.kind === 'search' && query.text ? `« ${query.text} »` : 'Tes dernières photos'),
    [query],
  );

  return (
    <div className="animate-fade flex min-h-0 flex-1 flex-col">
      {/* Sous-en-tête : retour + identité de la compétence + recherche */}
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
            <KaiPresence size="sm" /> Photos
          </span>
          {result && !result.live ? <Badge tone="accent">démo</Badge> : null}
        </div>
        <SearchInput
          value={text}
          onValueChange={setText}
          onSearch={(t) =>
            run(t.trim() ? { kind: 'search', text: t.trim() } : { kind: 'timeline' })
          }
          onClear={() => run({ kind: 'timeline' })}
          placeholder="Rechercher dans tes photos…"
        />
        <p className="text-sm text-text-muted">{title}</p>
      </div>

      {/* Contenu */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {result === null ? (
          <div className="flex justify-center py-16 text-accent">
            <Spinner size="lg" label="Chargement des photos" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-text-muted">Aucune photo pour cette recherche.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {items.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setOpened(i)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-hover focus-visible:outline-none focus-visible:shadow-focus"
              >
                <img
                  src={photo.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-base ease-out group-hover:scale-[1.04]"
                />
              </button>
            ))}
          </div>
        )}

        {albums.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              Albums
            </h2>
            <div className="flex flex-wrap gap-2">
              {albums.map((a) => (
                <span
                  key={a.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  {a.title} <span className="text-text-muted">· {a.photoCount}</span>
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <Lightbox
        open={current != null}
        onClose={() => setOpened(null)}
        {...(items.length > 1 ? { onPrev: () => move(-1), onNext: () => move(1) } : {})}
        caption={caption(current)}
        label="Photo"
      >
        {current ? (
          <img
            src={current.thumbnailUrl}
            alt=""
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
        ) : null}
      </Lightbox>
    </div>
  );
}
