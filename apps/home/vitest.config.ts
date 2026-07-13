import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    // La curation est de la logique pure : pas besoin du DOM.
    environment: 'node',
  },
});
