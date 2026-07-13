import type { SVGProps } from 'react';
import { cx } from '../cx.js';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: SpinnerSize;
  /** Libellé accessible (annoncé aux lecteurs d'écran). */
  label?: string;
}

const px: Record<SpinnerSize, number> = { sm: 16, md: 20, lg: 28 };

/**
 * Indicateur de chargement circulaire.
 *
 * A11y : `role="status"` + `aria-label` ; l'animation utilise `animate-spin`
 * (désactivée par `prefers-reduced-motion` au niveau de l'app).
 */
export function Spinner({ size = 'md', label = 'Chargement…', className, ...rest }: SpinnerProps) {
  const d = px[size];
  return (
    <svg
      role="status"
      aria-label={label}
      width={d}
      height={d}
      viewBox="0 0 24 24"
      fill="none"
      className={cx('animate-spin', className)}
      {...rest}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
