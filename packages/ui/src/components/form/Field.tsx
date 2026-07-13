import type { ReactNode } from 'react';
import { cx } from '../../cx.js';

export interface FieldProps {
  /** Id du contrôle (pour lier le label). */
  id: string;
  helpId: string;
  errorId: string;
  label?: ReactNode;
  help?: ReactNode;
  /** Message d'erreur ; s'il est présent, l'aide est masquée. */
  error?: ReactNode;
  required?: boolean | undefined;
  /** Le contrôle (input, select…). */
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Ossature commune d'un champ de formulaire (ADR-0017) : label lié, message
 * d'aide, message d'erreur accessible. Mutualisée pour que **les modules ne
 * réimplémentent jamais** la validation, les erreurs ou l'accessibilité.
 *
 * A11y : `label htmlFor`, aide/erreur reliées via `aria-describedby` (posé par le
 * contrôle avec {@link fieldDescribedBy}), erreur en `role="alert"`.
 */
export function Field({
  id,
  helpId,
  errorId,
  label,
  help,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="text-sm text-text-muted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** Construit `aria-describedby`/`aria-invalid` cohérents pour le contrôle. */
export function fieldDescribedBy(
  ids: { helpId: string; errorId: string },
  opts: { help?: unknown; error?: unknown },
): { 'aria-describedby'?: string; 'aria-invalid'?: true } {
  if (opts.error) return { 'aria-describedby': ids.errorId, 'aria-invalid': true };
  if (opts.help) return { 'aria-describedby': ids.helpId };
  return {};
}

/** Classe de base partagée par les contrôles de saisie (silence & lisibilité). */
export const controlBase =
  'w-full bg-surface text-text placeholder:text-text-muted rounded-md border ' +
  'transition duration-fast ease-out focus-visible:outline-none ' +
  'focus-visible:shadow-focus disabled:opacity-50 disabled:pointer-events-none';

/** Bordure selon l'état (repos / erreur). */
export function controlBorder(hasError?: unknown): string {
  return hasError ? 'border-danger' : 'border-border-strong';
}
