import { type HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Hauteur max avant défilement (ex. `320px`, `60vh`). */
  maxHeight?: number | string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

/**
 * Zone défilable au style discret (barre fine, tokens). Le défilement natif est
 * conservé (performance, tactile) — on ne fait qu'habiller la barre.
 */
export function ScrollArea({
  maxHeight,
  orientation = 'vertical',
  className,
  style,
  children,
  ...rest
}: ScrollAreaProps) {
  const overflow =
    orientation === 'both'
      ? 'overflow-auto'
      : orientation === 'horizontal'
        ? 'overflow-x-auto overflow-y-hidden'
        : 'overflow-y-auto overflow-x-hidden';
  return (
    <div
      className={cx(
        overflow,
        // Barre fine et discrète (WebKit + Firefox).
        '[scrollbar-width:thin] [scrollbar-color:var(--kos-border-strong)_transparent]',
        '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        className,
      )}
      style={{ maxHeight, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
