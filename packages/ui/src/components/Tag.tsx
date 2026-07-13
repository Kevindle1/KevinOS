import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Rend le tag supprimable (affiche un bouton ✕) et gère le clic. */
  onRemove?: () => void;
  /** Libellé accessible du bouton de suppression. */
  removeLabel?: string;
}

/**
 * Tag : étiquette (filtre, mot-clé), optionnellement supprimable.
 *
 * A11y : le bouton de suppression a un `aria-label` explicite et un focus
 * visible ; il est atteignable au clavier.
 */
export function Tag({ onRemove, removeLabel = 'Retirer', className, children, ...rest }: TagProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface',
        'pl-3 h-8 text-sm text-text-secondary',
        onRemove ? 'pr-1.5' : 'pr-3',
        className,
      )}
      {...rest}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${removeLabel} ${typeof children === 'string' ? children : ''}`.trim()}
          className={cx(
            'inline-grid place-items-center w-5 h-5 rounded-full text-text-muted',
            'hover:bg-hover hover:text-text transition duration-fast ease-out',
            'focus-visible:outline-none focus-visible:shadow-focus',
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </span>
  );
}
