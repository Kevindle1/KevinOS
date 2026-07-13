/**
 * Gestion du thème clair/sombre — sans dépendance, sans framework.
 *
 * La préférence utilisateur (posée sur `data-theme` de `<html>`) prime toujours
 * sur `prefers-color-scheme`. Persistée en `localStorage`.
 */
export type Theme = 'light' | 'dark';
export type ThemeSetting = Theme | 'system';

const STORAGE_KEY = 'kos-theme';

/** Thème effectivement affiché (résout `system` selon l'OS). */
export function resolveTheme(setting: ThemeSetting): Theme {
  if (setting === 'system') {
    const canMatch = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
    return canMatch && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return setting;
}

/** Lit la préférence enregistrée (défaut : `system`). */
export function getStoredTheme(): ThemeSetting {
  if (typeof localStorage === 'undefined') return 'system';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

/** Applique un réglage : stamp `data-theme` (ou le retire pour `system`). */
export function applyTheme(setting: ThemeSetting): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (setting === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', setting);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, setting);
  }
}

/** Initialise le thème au démarrage depuis la préférence enregistrée. */
export function initTheme(): ThemeSetting {
  const setting = getStoredTheme();
  applyTheme(setting);
  return setting;
}
