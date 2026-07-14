import type { PlaybackProgress } from '@kevinos/shared';

/**
 * Repli **localStorage** de la progression — uniquement quand aucun Core n'est
 * joignable (Preview). Permet à la boucle « je regarde → je ferme → je reviens →
 * KAI propose de reprendre » d'être démontrable même sans backend. Avec un Core,
 * c'est le `PlaybackStore` de KevinOS qui fait foi.
 */
const KEY = 'kos-progress';

function readAll(): Record<string, PlaybackProgress> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, PlaybackProgress>;
  } catch {
    return {};
  }
}

export function getLocalProgress(id: string): PlaybackProgress | undefined {
  return readAll()[id];
}

export function setLocalProgress(id: string, positionSec: number, durationSec: number): void {
  try {
    const all = readAll();
    all[id] = {
      positionSec: Math.round(positionSec),
      durationSec: Math.round(durationSec),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* stockage indisponible : on ignore */
  }
}
