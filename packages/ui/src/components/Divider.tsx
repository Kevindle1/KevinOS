import { type ReactNode } from 'react';
import { cx } from '../cx.js';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Libellé centré (horizontal uniquement). */
  label?: ReactNode;
  className?: string;
}

/**
 * Séparateur discret. Horizontal (avec libellé optionnel) ou vertical.
 *
 * A11y : `role="separator"` avec `aria-orientation` ; décoratif si labellisé.
 */
export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cx('w-px self-stretch bg-border', className)}
      />
    );
  }
  if (label) {
    return (
      <div className={cx('flex items-center gap-3 text-text-muted', className)}>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }
  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={cx('h-px border-0 bg-border', className)}
    />
  );
}
