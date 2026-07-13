import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../cx.js';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  /** État « partiellement coché ». */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Case à cocher — s'appuie sur l'input natif (robustesse, a11y, mobile) coloré
 * par le token d'accent. Supporte l'état indéterminé.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, onCheckedChange, onChange, className, disabled, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cx(
        'inline-flex items-center gap-2.5 text-sm text-text',
        disabled ? 'opacity-50' : 'cursor-pointer',
      )}
    >
      <input
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="checkbox"
        disabled={disabled}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        style={{ accentColor: 'var(--kos-accent)' }}
        className={cx(
          'h-4 w-4 rounded focus-visible:outline-none focus-visible:shadow-focus',
          className,
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
});
