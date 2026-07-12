/**
 * Port de vérification de disponibilité (domaine).
 *
 * Chaque dépendance critique du Core (base de données, fournisseur IA, module…)
 * fournit un `ReadinessCheck`. Le domaine ne connaît que cette interface : les
 * implémentations concrètes vivent dans `infrastructure/`.
 */
export interface ReadinessCheck {
  /** Nom court et stable, ex. `postgres`, `kai`. */
  readonly name: string;

  /** Renvoie `true` si la dépendance est joignable et saine. */
  check(signal?: AbortSignal): Promise<boolean>;
}
