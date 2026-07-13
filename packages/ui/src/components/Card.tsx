import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Élève la carte (menus, éléments actifs). */
  elevated?: boolean;
  /** Rend la carte interactive (survol + curseur). */
  interactive?: boolean;
}

/**
 * Conteneur de base du KDS : surface, contour subtil, rayon `lg`. Brique de
 * toutes les cartes (ModuleCard, StatTile…). Couleurs par tokens uniquement.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevated = false, interactive = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        'rounded-lg border border-border p-6',
        elevated ? 'bg-elevated shadow-2' : 'bg-surface shadow-1',
        interactive &&
          'transition duration-base ease-out hover:bg-hover cursor-pointer ' +
            'focus-visible:outline-none focus-visible:shadow-focus',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
