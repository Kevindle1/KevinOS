import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Affiche une petite pastille de couleur avant le libellé. */
  dot?: boolean;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-hover text-text-secondary',
  accent: 'bg-accent-subtle text-accent',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};

const dotColor: Record<BadgeTone, string> = {
  neutral: 'bg-text-muted',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

/**
 * Badge : statut compact et lisible d'un coup d'œil.
 *
 * A11y : purement visuel ; si le badge porte une info non redondante, fournir un
 * texte lisible (il est déjà textuel par défaut).
 */
export function Badge({ tone = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot ? <span className={cx('w-1.5 h-1.5 rounded-full', dotColor[tone])} /> : null}
      {children}
    </span>
  );
}
