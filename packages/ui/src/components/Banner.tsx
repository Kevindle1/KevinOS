import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: BannerTone;
  title?: ReactNode;
  /** Action de fermeture ; si fourni, affiche un bouton ✕. */
  onDismiss?: () => void;
}

const tones: Record<BannerTone, { box: string; icon: string; glyph: string }> = {
  info: { box: 'bg-info-subtle border-border', icon: 'text-info', glyph: 'i' },
  success: { box: 'bg-success-subtle border-border', icon: 'text-success', glyph: '✓' },
  warning: { box: 'bg-warning-subtle border-border', icon: 'text-warning', glyph: '!' },
  danger: { box: 'bg-danger-subtle border-border', icon: 'text-danger', glyph: '!' },
};

/**
 * Bandeau d'information inline (non modal, dans le flux).
 *
 * A11y : `role="alert"` pour danger/warning (annonce immédiate),
 * `role="status"` sinon (annonce polie). Le bouton de fermeture a un `aria-label`.
 */
export function Banner({
  tone = 'info',
  title,
  onDismiss,
  className,
  children,
  ...rest
}: BannerProps) {
  const t = tones[tone];
  const role = tone === 'danger' || tone === 'warning' ? 'alert' : 'status';
  return (
    <div role={role} className={cx('flex gap-3 rounded-lg border p-4', t.box, className)} {...rest}>
      <span
        aria-hidden="true"
        className={cx(
          'mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-xs font-bold',
          t.icon,
        )}
      >
        {t.glyph}
      </span>
      <div className="min-w-0 flex-1">
        {title ? <div className="font-medium text-text">{title}</div> : null}
        {children ? <div className="text-sm text-text-secondary">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          className={cx(
            'grid h-6 w-6 flex-none place-items-center rounded-md text-text-muted',
            'hover:bg-hover hover:text-text transition duration-fast ease-out',
            'focus-visible:outline-none focus-visible:shadow-focus',
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
