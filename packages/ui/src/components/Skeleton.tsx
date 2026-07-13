import type { HTMLAttributes, CSSProperties } from 'react';
import { cx } from '../cx.js';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  /** Forme : rectangle arrondi (défaut), cercle, ou texte. */
  shape?: 'rect' | 'circle' | 'text';
}

const radius: Record<NonNullable<SkeletonProps['shape']>, string> = {
  rect: 'rounded-md',
  circle: 'rounded-full',
  text: 'rounded-sm',
};

/**
 * Placeholder de chargement (remplace le contenu à sa forme — pas de spinner
 * plein écran). Préfère un `Skeleton` à la forme du contenu attendu.
 *
 * A11y : décoratif → `aria-hidden`. Le conteneur parent porte `aria-busy`.
 */
export function Skeleton({
  width,
  height,
  shape = 'rect',
  className,
  style,
  ...rest
}: SkeletonProps) {
  const dims: CSSProperties = {
    width,
    height: height ?? (shape === 'text' ? '1em' : undefined),
    ...style,
  };
  return (
    <div
      aria-hidden="true"
      className={cx('bg-hover animate-pulse', radius[shape], className)}
      style={dims}
      {...rest}
    />
  );
}
