import { cx } from '../../cx.js';
import { useControllableState, useFieldIds } from '../../hooks.js';
import { Field } from './Field.js';
import type { ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Disposition. */
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * Choix exclusif — s'appuie sur les inputs radio natifs (a11y clavier gratuite),
 * colorés par l'accent. Contrôlé ou non-contrôlé.
 *
 * A11y : `role="radiogroup"` labellisé ; chaque option est un vrai `input radio`.
 */
export function RadioGroup({
  options,
  value,
  defaultValue = '',
  onValueChange,
  name,
  label,
  help,
  error,
  required,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  const ids = useFieldIds();
  const groupName = name ?? ids.id;
  const [val, setVal] = useControllableState<string>({
    ...(value !== undefined ? { value } : {}),
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

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
      <div
        role="radiogroup"
        aria-label={typeof label === 'string' ? label : undefined}
        className={cx(
          'flex gap-x-5 gap-y-2.5',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className,
        )}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cx(
              'inline-flex items-center gap-2.5 text-sm text-text',
              opt.disabled ? 'opacity-50' : 'cursor-pointer',
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={opt.value}
              checked={val === opt.value}
              disabled={opt.disabled}
              onChange={() => setVal(opt.value)}
              style={{ accentColor: 'var(--kos-accent)' }}
              className="h-4 w-4 focus-visible:outline-none focus-visible:shadow-focus"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}
