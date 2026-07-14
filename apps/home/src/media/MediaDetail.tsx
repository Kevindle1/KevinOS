import { useEffect, useState } from 'react';
import { Button, Badge, Spinner, Progress } from '@kevinos/ui';
import type { MovieDetail, SeriesDetail, MediaItem, Rating } from '@kevinos/shared';
import { loadMovie, loadSeries } from './mediaClient.js';

export type DetailRef = { kind: 'movie' | 'series'; id: string };
export interface PlayTarget {
  id: string;
  title: string;
  kind: 'movie' | 'series';
}

const RATING_LABEL: Record<Rating['source'], string> = {
  tmdb: 'TMDB',
  imdb: 'IMDb',
  rotten: 'Rotten',
  metacritic: 'Metacritic',
};

function mins(sec: number): number {
  return Math.floor(sec / 60);
}

/** Lignes « intelligentes » de KAI, honnêtes (dérivées de la progression). */
function kaiInsights(movie: MovieDetail | null, series: SeriesDetail | null): string[] {
  const out: string[] = [];
  const p = movie?.progress;
  if (p && p.positionSec > 0) {
    out.push(`Tu avais arrêté ce film à ${mins(p.positionSec)} min.`);
    out.push(`Il te reste ${Math.max(0, mins(p.durationSec - p.positionSec))} minutes.`);
  }
  if (series) {
    out.push(`${series.watchedCount}/${series.episodeCount} épisodes vus.`);
    if (series.remainingMin)
      out.push(`Encore ${Math.round(series.remainingMin / 60)} h environ pour terminer la série.`);
  }
  return out;
}

/**
 * Fiche **immersive** d'un film / d'une série (proche Apple TV / Netflix). Affiche,
 * notes, casting, résumé, progression, similaires — puis on lance le lecteur
 * officiel KevinOS. Home ne connaît que le contrat (`/api/v1/media*`).
 */
export function MediaDetail({
  detail,
  onBack,
  onPlay,
  onOpen,
  onSuggest,
}: {
  detail: DetailRef;
  onBack: () => void;
  onPlay: (target: PlayTarget) => void;
  onOpen: (ref: DetailRef) => void;
  onSuggest: (prompt: string) => void;
}) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [series, setSeries] = useState<SeriesDetail | null>(null);

  useEffect(() => {
    setMovie(null);
    setSeries(null);
    if (detail.kind === 'movie') void loadMovie(detail.id).then(setMovie);
    else void loadSeries(detail.id).then(setSeries);
  }, [detail]);

  const media: MediaItem | undefined = movie?.media ?? series?.media;
  const enrichment = movie?.enrichment ?? series?.enrichment;
  const progress = movie?.progress ?? null;

  if (!media) {
    return (
      <div className="flex justify-center py-16 text-accent">
        <Spinner size="lg" label="Chargement de la fiche" />
      </div>
    );
  }

  const resume = progress && progress.positionSec > 0;
  const insights = kaiInsights(movie, series);
  const similar = enrichment?.similar ?? [];

  return (
    <div className="animate-fade">
      {/* Bandeau immersif : affiche floutée en fond */}
      <div className="relative -mx-5 -mt-2 h-40 overflow-hidden sm:-mx-8 sm:h-56">
        <img
          src={media.posterUrl}
          alt=""
          className="h-full w-full scale-110 object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--kos-bg))]" />
        <button
          type="button"
          onClick={onBack}
          className="absolute left-1 top-1 rounded-full bg-surface/70 px-2.5 py-1.5 text-sm text-text-muted backdrop-blur transition duration-fast ease-out hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
        >
          <span aria-hidden="true">←</span> Retour
        </button>
      </div>

      <div className="-mt-16 flex flex-col gap-4 sm:flex-row">
        <img
          src={media.posterUrl}
          alt=""
          className="relative aspect-[2/3] w-28 shrink-0 rounded-lg object-cover shadow-3 sm:w-36"
        />
        <div className="min-w-0 flex-1 space-y-3 pt-14 sm:pt-16">
          <div>
            <h1 className="text-2xl font-semibold text-text">{media.title}</h1>
            <p className="text-sm text-text-muted">
              {[
                media.year,
                media.genres[0],
                media.runtimeMin ? `${media.runtimeMin} min` : null,
                enrichment?.director ? `réal. ${enrichment.director}` : null,
                enrichment?.country,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          {enrichment?.ratings && enrichment.ratings.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {enrichment.ratings.map((r) => (
                <Badge key={r.source} tone="accent">
                  {RATING_LABEL[r.source]} {r.score}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {media.overview ? <p className="text-sm text-text-secondary">{media.overview}</p> : null}

        {resume && progress ? (
          <div className="space-y-1">
            <Progress value={Math.round((progress.positionSec / progress.durationSec) * 100)} />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => onPlay({ id: media.id, title: media.title, kind: media.kind })}
          >
            {resume ? '▶ Reprendre' : '▶ Lire'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onSuggest(`Montre-moi des films similaires à ${media.title}`)}
          >
            🎞 Similaires
          </Button>
          {enrichment?.director ? (
            <Button
              variant="ghost"
              onClick={() => onSuggest(`Montre-moi des films de ${enrichment.director}`)}
            >
              🎬 Même réalisateur
            </Button>
          ) : null}
        </div>

        {/* KAI enrichit naturellement */}
        {insights.length > 0 ? (
          <div className="rounded-lg border border-border bg-surface p-3 text-sm text-text-secondary">
            {insights.map((line) => (
              <p key={line}>✦ {line}</p>
            ))}
          </div>
        ) : null}

        {/* Casting */}
        {enrichment?.cast && enrichment.cast.length > 0 ? (
          <section className="space-y-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">Casting</h2>
            <p className="text-sm text-text-secondary">
              {enrichment.cast.map((c) => c.name).join(', ')}
            </p>
          </section>
        ) : null}

        {/* Séries : épisodes */}
        {series && series.seasons.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {series.seasons.length} saison{series.seasons.length > 1 ? 's' : ''} ·{' '}
                {series.episodeCount} épisodes
              </h2>
              {series.nextEpisode ? (
                <span className="text-xs text-text-muted">
                  À suivre : S{series.nextEpisode.season}E{series.nextEpisode.episode}
                </span>
              ) : null}
            </div>
            {series.seasons.map((s) => (
              <div key={s.season} className="space-y-1.5">
                {s.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-sm text-text">
                      {ep.season}×{ep.episode} · {ep.title}
                    </span>
                    <span className="ml-3 shrink-0 text-xs text-text-muted">
                      {ep.progress
                        ? `${Math.round((ep.progress.positionSec / ep.progress.durationSec) * 100)} %`
                        : ep.runtimeMin
                          ? `${ep.runtimeMin} min`
                          : ''}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ) : null}

        {/* Similaires */}
        {similar.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Films similaires
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {similar.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onOpen({ kind: m.kind, id: m.id })}
                  className="flex w-24 shrink-0 flex-col gap-1.5 text-left focus-visible:outline-none"
                >
                  <img
                    src={m.posterUrl}
                    alt=""
                    className="aspect-[2/3] w-full rounded-lg object-cover"
                  />
                  <span className="truncate text-xs text-text">{m.title}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
