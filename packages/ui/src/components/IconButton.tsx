import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../cx.js';

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icône (nécessairement décorative — le sens vient de `aria-label`). */
  icon: ReactNode;
  /** Libellé accessible **obligatoire** (bouton sans texte visible). */
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variants: Record<IconButtonVariant, string> = {
  ghost: 'text-text-secondary hover:bg-hover hover:text-text',
  secondary: 'bg-surface border border-border-strong text-text hover:bg-hover',
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  danger: 'text-danger hover:bg-danger-subtle',
};

// md = 44px (cible tactile confortable, ADR-0017 perf/mobile).
const sizes: Record<IconButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
};

/**
 * Bouton icône — action compacte avec **cible tactile** confortable (≥ 44 px en
 * taille md). Discret par défaut.
 *
 * A11y : `aria-label` obligatoire (rendu type-safe), focus visible, état pressé.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'ghost', size = 'md', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        'inline-grid place-items-center rounded-md transition duration-fast ease-out active:scale-[.96]',
        'focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
});
