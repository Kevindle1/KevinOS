import kosPreset from '@kevinos/ui/preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [kosPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Indispensable : scanner les composants de la bibliothèque pour générer
    // les classes utilitaires qu'ils utilisent.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
