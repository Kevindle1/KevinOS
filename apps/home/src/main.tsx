import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initTheme } from '@kevinos/ui';
import '@kevinos/ui/tokens.css';
import './index.css';
import { Root } from './Root.js';

// Le thème (clair/sombre/système) est posé avant le premier rendu.
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
