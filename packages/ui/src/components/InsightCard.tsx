import { type ReactNode, type HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type InsightAccent =
  'accent' | 'vision' | 'media' | 'drive' | 'home' | 'monitor' | 'backup' | 'info';

export interface InsightCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onClick' | 'title'
> {
  /** Pictogramme (emoji ou icône) — décoratif. */
  icon?: ReactNode;
  /** Intitulé court (ex. « Photos »). */
  label: ReactNode;
  /** Information vive, mise en avant (ex. « 148 nouvelles »). */
  value: ReactNode;
  /** Détail secondaire optionnel (ex. « ajoutées aujourd'hui »). */
  meta?: ReactNode;
  /** Teinte d'accent du pictogramme. */
  accent?: InsightAccent;
  /** Rend la carte actionnable (bouton) — ex. demander à KAI. */
  onActivate?: () => void;
}

const accentText: Record<InsightAccent, string> = {
  accent: 'text-accent',
  vision: 'text-vision',
  media: 'text-media',
  drive: 'text-drive',
  home: 'text-home',
  monitor: 'text-monitor',
  backup: 'text-backup',
  info: 'text-info',
};

/**
 * Carte **glanceable** : une information vive, lisible d'un coup d'œil. Brique de
 * l'accueil « vivant » de KevinOS (Règle 9) — état serveur, dernières photos,
 * média à reprendre, sauvegarde… Composée par les expériences, jamais par la lib.
 *
 * Actionnable (`onActivate`) → rendue comme **bouton** (cible tactile, focus,
 * `active:scale`). Sinon, simple surface. Le pictogramme est décoratif ; le sens
 * vit dans `label`/`value`.
 */
export function InsightCard({
  icon,
  label,
  value,
  meta,
  accent = 'accent',
  onActivate,
  className,
  ...rest
}: InsightCardProps) {
  const interactive = typeof onActivate === 'function';

  const inner = (
    <>
      {icon != null ? (
        <span
          aria-hidden="true"
          className={cx(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-hover text-xl',
            accentText[accent],
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        <span className="truncate text-[15px] font-medium text-text">{value}</span>
        {meta != null ? <span className="truncate text-xs text-text-muted">{meta}</span> : null}
      </span>
    </>
  );

  const base = 'flex items-center gap-3.5 rounded-lg border border-border bg-surface p-4 text-left';

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onActivate}
        className={cx(
          base,
          'w-full transition duration-base ease-out',
          'hover:bg-hover hover:border-border-strong active:scale-[.99]',
          'focus-visible:outline-none focus-visible:shadow-focus',
          className,
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={cx(base, className)} {...rest}>
      {inner}
    </div>
  );
}
