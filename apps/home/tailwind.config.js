import kosPreset from '@kevinos/ui/preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [kosPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Scanner la bibliothèque pour générer les classes utilitaires qu'elle utilise.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
