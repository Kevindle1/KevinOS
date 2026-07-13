import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type Status = 'up' | 'warning' | 'down' | 'unknown';

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status: Status;
  /** Libellé lisible ; si absent, un libellé par défaut par statut est utilisé. */
  label?: string;
  /** Masque le libellé visuel (garde l'accessibilité). */
  hideLabel?: boolean;
}

const color: Record<Status, string> = {
  up: 'text-success',
  warning: 'text-warning',
  down: 'text-danger',
  unknown: 'text-text-muted',
};

const defaultLabel: Record<Status, string> = {
  up: 'En ligne',
  warning: 'À surveiller',
  down: 'Hors ligne',
  unknown: 'Inconnu',
};

/**
 * Indicateur d'état : un point coloré (avec halo) + un libellé. Encode l'état
 * dans la **forme et la couleur**, pas seulement le texte (lisible d'un coup
 * d'œil dans un tableau de bord).
 *
 * A11y : la couleur n'est jamais la seule porteuse d'information — le libellé
 * (visible ou via `aria-label` si masqué) donne l'état en toutes lettres.
 */
export function StatusIndicator({
  status,
  label,
  hideLabel = false,
  className,
  ...rest
}: StatusIndicatorProps) {
  const text = label ?? defaultLabel[status];
  return (
    <span
      className={cx('inline-flex items-center gap-2 text-sm text-text-secondary', className)}
      {...(hideLabel ? { 'aria-label': text } : {})}
      {...rest}
    >
      <span
        className={cx('w-2.5 h-2.5 rounded-full bg-current', color[status])}
        style={{ boxShadow: '0 0 0 3px color-mix(in srgb, currentColor 18%, transparent)' }}
        aria-hidden="true"
      />
      {hideLabel ? null : <span>{text}</span>}
    </span>
  );
}
