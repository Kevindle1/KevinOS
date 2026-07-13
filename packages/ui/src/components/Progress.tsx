import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Valeur courante. Omettre pour un état indéterminé. */
  value?: number;
  max?: number;
  /** Libellé accessible de la progression. */
  label?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

const toneBar: Record<NonNullable<ProgressProps['tone']>, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/**
 * Barre de progression linéaire, déterminée (`value`) ou indéterminée.
 *
 * A11y : `role="progressbar"` avec `aria-valuenow/min/max` en mode déterminé ;
 * sans `value`, l'état indéterminé est signalé (pas de `aria-valuenow`).
 */
export function Progress({
  value,
  max = 100,
  label = 'Progression',
  tone = 'accent',
  className,
  ...rest
}: ProgressProps) {
  const indeterminate = value === undefined;
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : value}
      className={cx('h-2 w-full overflow-hidden rounded-full bg-hover', className)}
      {...rest}
    >
      <div
        className={cx(
          'h-full rounded-full transition-[width] duration-slow ease-out',
          toneBar[tone],
          indeterminate && 'w-1/3 animate-pulse',
        )}
        style={indeterminate ? undefined : { width: `${pct}%` }}
      />
    </div>
  );
}
