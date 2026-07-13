/** Concatène des classes conditionnelles (utilitaire minimal, sans dépendance). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
