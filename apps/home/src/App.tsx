import { useState } from 'react';
import { IconButton, applyTheme, getStoredTheme, type ThemeSetting } from '@kevinos/ui';
import { KaiConversation } from './kai/KaiConversation.js';

/** Icônes du sélecteur de thème (décoratives — le sens vient de l'aria-label). */
const THEME_ICON: Record<ThemeSetting, string> = {
  light: '☀️',
  dark: '🌙',
  system: '🖥️',
};
const THEME_LABEL: Record<ThemeSetting, string> = {
  light: 'Thème clair',
  dark: 'Thème sombre',
  system: 'Thème système',
};
const NEXT: Record<ThemeSetting, ThemeSetting> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

/**
 * La coque de KevinOS. Une seule interface (Règle 6), sobre : une barre discrète
 * et, au centre, **Home** — l'accueil centré sur KAI. Pas de grille de widgets ;
 * une page vivante.
 */
export function App() {
  const [theme, setTheme] = useState<ThemeSetting>(() => getStoredTheme());

  function cycleTheme() {
    const next = NEXT[theme];
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
        <span className="flex items-center gap-2 font-semibold tracking-tight text-text">
          <span aria-hidden="true" className="text-accent">
            ✦
          </span>
          KevinOS
        </span>
        <IconButton
          aria-label={`${THEME_LABEL[theme]} — changer`}
          icon={<span className="text-lg">{THEME_ICON[theme]}</span>}
          onClick={cycleTheme}
        />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-6 sm:px-8">
        <KaiConversation />
      </main>
    </div>
  );
}
