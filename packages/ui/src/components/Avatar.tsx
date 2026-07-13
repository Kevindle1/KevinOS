import { type HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Nom complet — sert d'`alt` et de repli en initiales. */
  name: string;
  src?: string;
  size?: AvatarSize;
}

const sizes: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Avatar — image si fournie, sinon **initiales** sur fond neutre. Rond, sobre.
 *
 * A11y : l'image porte `alt={name}` ; le repli initiales expose `aria-label`.
 */
export function Avatar({ name, src, size = 'md', className, ...rest }: AvatarProps) {
  return (
    <span
      className={cx(
        'inline-grid place-items-center overflow-hidden rounded-full bg-hover font-medium text-text-secondary',
        sizes[size],
        className,
      )}
      aria-label={src ? undefined : name}
      role={src ? undefined : 'img'}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
