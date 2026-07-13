import { useCallback, useId, useRef, useState } from 'react';

/**
 * État « contrôlable » : un composant fonctionne en mode **contrôlé**
 * (`value` + `onChange`) OU **non-contrôlé** (`defaultValue`), sans que l'appelant
 * ait à choisir dans le code du composant (ADR-0017 — API formulaire).
 */
export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const current = isControlled ? (value as T) : internal;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, set];
}

/**
 * Identifiants stables d'un champ (contrôle + aide + erreur) pour câbler
 * l'accessibilité (`htmlFor`, `aria-describedby`) sans collision.
 */
export function useFieldIds(providedId?: string): {
  id: string;
  helpId: string;
  errorId: string;
} {
  const auto = useId();
  const id = providedId ?? auto;
  return { id, helpId: `${id}-help`, errorId: `${id}-error` };
}

/** Renvoie une valeur stable au premier rendu (utile pour un id non-React). */
export function useConst<T>(factory: () => T): T {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = factory();
  return ref.current;
}
