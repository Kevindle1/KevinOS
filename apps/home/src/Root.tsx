import { useState } from 'react';
import { App } from './App.js';
import { getBuildInfo } from './build-info.js';
import { PreviewWelcome } from './preview/PreviewWelcome.js';

const enteredKey = (commit: string) => `kos-preview-entered:${commit}`;

/**
 * Aiguillage racine. En **mode Preview**, on montre d'abord l'écran d'accueil de
 * la Preview (une fois par visite et par version), puis on entre dans Home. Hors
 * Preview (production), on va directement dans Home.
 */
export function Root() {
  const info = getBuildInfo();
  const [entered, setEntered] = useState(() => {
    if (!info.preview) return true;
    try {
      return sessionStorage.getItem(enteredKey(info.commit)) === '1';
    } catch {
      return false;
    }
  });

  if (!entered) {
    return (
      <PreviewWelcome
        info={info}
        onEnter={() => {
          try {
            sessionStorage.setItem(enteredKey(info.commit), '1');
          } catch {
            /* stockage indisponible : on entre quand même */
          }
          setEntered(true);
        }}
      />
    );
  }
  return <App />;
}
