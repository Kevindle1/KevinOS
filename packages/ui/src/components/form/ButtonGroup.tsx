import { type ReactNode } from 'react';
import { cx } from '../../cx.js';
import { useControllableState } from '../../hooks.js';

export interface SegmentOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Libellé accessible du groupe. */
  ariaLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const heights = { sm: 'h-8 text-sm', md: 'h-10' } as const;

/**
 * Contrôle segmenté (groupe de boutons à choix unique) — contrôlé ou non.
 * Sobre : l'option active porte l'accent subtil, le reste reste discret.
 *
 * A11y : `role="group"` labellisé ; chaque segment est un bouton `aria-pressed`.
 */
export function ButtonGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  ariaLabel,
  size = 'md',
  className,
}: ButtonGroupProps) {
  const [val, setVal] = useControllableState<string>({
    ...(value !== undefined ? { value } : {}),
    defaultValue: defaultValue ?? options[0]?.value ?? '',
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cx(
        'inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === val;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={o.disabled}
            onClick={() => setVal(o.value)}
            className={cx(
              'rounded px-3 font-medium transition duration-fast ease-out',
              'focus-visible:outline-none focus-visible:shadow-focus',
              heights[size],
              o.disabled && 'opacity-50 pointer-events-none',
              active
                ? 'bg-accent-subtle text-accent'
                : 'text-text-secondary hover:bg-hover hover:text-text',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
