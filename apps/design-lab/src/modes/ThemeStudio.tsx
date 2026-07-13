import { useState } from 'react';
import { Button, Card, Badge, StatusIndicator, resolveTheme, type ThemeSetting } from '@kevinos/ui';

const ACCENTS: { id: string; name: string; token: string }[] = [
  { id: 'default', name: 'Signature (teal)', token: '' },
  { id: 'vision', name: '📷 Vision', token: '--kos-vision' },
  { id: 'media', name: '🎬 Media', token: '--kos-media' },
  { id: 'drive', name: '📁 Drive', token: '--kos-drive' },
  { id: 'home', name: '🏠 Home', token: '--kos-home' },
  { id: 'monitor', name: '📊 Monitor', token: '--kos-monitor' },
  { id: 'network', name: '🌐 Network', token: '--kos-network' },
];

/**
 * Mode 4 — Theme Studio : basculer Light / Dark / Auto en direct et prévisualiser
 * l'interface avec l'accent de chaque module KOS (le token `--kos-accent` est
 * surchargé à la volée, sans toucher au code).
 */
export function ThemeStudio({
  theme,
  onTheme,
}: {
  theme: ThemeSetting;
  onTheme: (t: ThemeSetting) => void;
}) {
  const [accent, setAccent] = useState('default');

  function chooseAccent(id: string, token: string) {
    setAccent(id);
    const root = document.documentElement;
    if (!token) {
      root.style.removeProperty('--kos-accent');
      root.style.removeProperty('--kos-accent-hover');
    } else {
      const value = getComputedStyle(root).getPropertyValue(token).trim();
      root.style.setProperty('--kos-accent', value);
      root.style.setProperty('--kos-accent-hover', value);
    }
  }

  const modes: ThemeSetting[] = ['light', 'dark', 'system'];

  return (
    <div className="p-8 overflow-auto h-full">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold">Theme Studio</h2>
        <p className="text-sm text-text-secondary mt-1">
          Tout se joue au niveau des tokens : aucun composant ne connaît le thème ni l'accent.
        </p>

        <div className="mt-6">
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted mb-2">
            Thème
          </div>
          <div className="flex gap-2">
            {modes.map((m) => (
              <Button
                key={m}
                variant={theme === m ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTheme(m)}
              >
                {m === 'light' ? '☀ Clair' : m === 'dark' ? '☾ Sombre' : '◐ Auto'}
              </Button>
            ))}
            <span className="self-center text-sm text-text-muted ml-2">
              actif : {resolveTheme(theme)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted mb-2">
            Accent système (aperçu par module)
          </div>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <Button
                key={a.id}
                variant={accent === a.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => chooseAccent(a.id, a.token)}
              >
                {a.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Aperçu live : ces composants reflètent immédiatement thème + accent */}
        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <div className="font-medium">Aperçu</div>
            <StatusIndicator status="up" />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button>Action primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Badge tone="accent" dot>
              Accent
            </Badge>
            <Badge tone="success" dot>
              Succès
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            Le texte secondaire, les contours et les surfaces suivent le thème choisi.
          </p>
        </Card>
      </div>
    </div>
  );
}
