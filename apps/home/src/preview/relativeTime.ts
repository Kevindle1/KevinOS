/**
 * Temps relatif en français (« il y a 3 minutes »), pour l'écran de Preview.
 * Volontairement minimal — pas de dépendance (Règle 8 : on n'importe pas une
 * lib de dates pour ça).
 */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'à une date inconnue';

  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 45) return "à l'instant";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;

  const days = Math.round(hours / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}
