import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../cx.js';
import { Spinner } from '../Spinner.js';
import { useFieldIds } from '../../hooks.js';
import { Field, fieldDescribedBy, controlBase, controlBorder } from './Field.js';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  inputSize?: InputSize;
  /** Indicateur de chargement (affiché en fin de champ). */
  loading?: boolean;
  /** Contenu au début du champ (icône…). */
  leading?: ReactNode;
  /** Contenu en fin de champ (action…). */
  trailing?: ReactNode;
  /** Raccourci : reçoit directement la valeur (en plus de `onChange`). */
  onValueChange?: (value: string) => void;
}

const heights: Record<InputSize, string> = { sm: 'h-9 text-sm', md: 'h-10', lg: 'h-12 text-base' };

/**
 * Champ texte du KDS — contrôlé ou non-contrôlé (`value` / `defaultValue`),
 * validation, aide et accessibilité intégrées (ADR-0017). Sobre par défaut.
 *
 * A11y : label lié, `aria-describedby` vers aide/erreur, `aria-invalid`,
 * `aria-required` ; focus visible.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    help,
    error,
    required,
    inputSize = 'md',
    loading = false,
    leading,
    trailing,
    onValueChange,
    onChange,
    className,
    id: providedId,
    disabled,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds(providedId);
  const trailingNode = loading ? <Spinner size="sm" label="" aria-hidden="true" /> : trailing;

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
        {leading ? (
          <span className="pointer-events-none absolute left-3 text-text-muted">{leading}</span>
        ) : null}
        <input
          ref={ref}
          id={ids.id}
          disabled={disabled || loading}
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
            leading ? 'pl-9' : 'pl-3',
            trailingNode ? 'pr-9' : 'pr-3',
            className,
          )}
          {...rest}
        />
        {trailingNode ? (
          <span className="absolute right-3 flex items-center text-text-muted">{trailingNode}</span>
        ) : null}
      </div>
    </Field>
  );
});
