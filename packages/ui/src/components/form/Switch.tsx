import { type ReactNode } from 'react';
import { cx } from '../../cx.js';
import { useControllableState } from '../../hooks.js';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  /** Libellé accessible si aucun `label` visible. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Bascule booléenne — bouton `role="switch"` (a11y clavier native : Espace/Entrée).
 * Contrôlée ou non-contrôlée. Discrète, mouvement doux.
 */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled = false,
  ariaLabel,
  className,
}: SwitchProps) {
  const [on, setOn] = useControllableState<boolean>({
    ...(checked !== undefined ? { value: checked } : {}),
    defaultValue: defaultChecked,
    ...(onCheckedChange ? { onChange: onCheckedChange } : {}),
  });

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={!label ? ariaLabel : undefined}
      disabled={disabled}
      onClick={() => setOn(!on)}
      className={cx(
        'relative h-6 w-11 flex-none rounded-full transition-colors duration-base ease-out',
        'focus-visible:outline-none focus-visible:shadow-focus',
        on ? 'bg-accent' : 'bg-border-strong',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-1 transition-transform duration-base ease-out',
          on ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );

  if (!label) return control;
  return (
    <label
      className={cx(
        'inline-flex items-center gap-3 text-sm text-text',
        disabled ? 'opacity-50' : 'cursor-pointer',
      )}
    >
      {control}
      <span>{label}</span>
    </label>
  );
}
