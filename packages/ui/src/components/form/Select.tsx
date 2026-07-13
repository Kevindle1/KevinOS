import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../cx.js';
import { useFieldIds } from '../../hooks.js';
import { Field, fieldDescribedBy, controlBase, controlBorder } from './Field.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  /** Option vide initiale (non sélectionnable). */
  placeholder?: string;
  onValueChange?: (value: string) => void;
  inputSize?: 'sm' | 'md' | 'lg';
}

const heights = { sm: 'h-9 text-sm', md: 'h-10', lg: 'h-12 text-base' } as const;

/**
 * Liste déroulante — s'appuie sur le `<select>` natif (a11y et ergonomie mobile
 * parfaites, robuste, performant), habillé par les tokens. Validation/aide/label
 * intégrés (ADR-0017).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    label,
    help,
    error,
    required,
    placeholder,
    onValueChange,
    onChange,
    inputSize = 'md',
    className,
    id: providedId,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds(providedId);
  return (
    <Field
      id={ids.id}
      helpId={ids.helpId}
      errorId={ids.errorId}
      label={label}
      help={help}
      error={error}
      required={required}
    >
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={ids.id}
          required={required}
          aria-required={required || undefined}
          {...fieldDescribedBy(ids, { help, error })}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          className={cx(
            controlBase,
            controlBorder(error),
            heights[inputSize],
            'appearance-none pl-3 pr-9 cursor-pointer',
            className,
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 text-text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </Field>
  );
});
