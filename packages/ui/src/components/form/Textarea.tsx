import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../cx.js';
import { useFieldIds } from '../../hooks.js';
import { Field, fieldDescribedBy, controlBase, controlBorder } from './Field.js';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  onValueChange?: (value: string) => void;
  /** Ajuste la hauteur au contenu. */
  autoGrow?: boolean;
}

/**
 * Saisie multiligne — contrôlée ou non, validation/aide/a11y intégrées (ADR-0017).
 * `autoGrow` ajuste la hauteur au contenu.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    help,
    error,
    required,
    onValueChange,
    onChange,
    autoGrow = false,
    rows = 3,
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
      <textarea
        ref={ref}
        id={ids.id}
        rows={rows}
        required={required}
        aria-required={required || undefined}
        {...fieldDescribedBy(ids, { help, error })}
        onChange={(e) => {
          if (autoGrow) {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        className={cx(controlBase, controlBorder(error), 'px-3 py-2 resize-y', className)}
        {...rest}
      />
    </Field>
  );
});
