import { defineConfig } from 'vitest/config';

export default defineConfig({
  // JSX automatique (pas besoin d'importer React dans chaque fichier).
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
