import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../cx.js';
import { Spinner } from './Spinner.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Affiche l'état de chargement et désactive l'action. */
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md ' +
  'transition duration-base ease-out active:scale-[.98] ' +
  'focus-visible:outline-none focus-visible:shadow-focus ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface text-text border border-border-strong hover:bg-hover',
  ghost: 'bg-transparent text-text-secondary hover:bg-hover hover:text-text',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Bouton du KOS Design System. Toutes les couleurs proviennent des tokens
 * (aucune valeur en dur). États : hover, focus-visible, active, disabled, loading.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" label="" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
