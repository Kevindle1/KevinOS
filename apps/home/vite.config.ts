import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

const env = process.env;

/**
 * Informations de build injectées dans l'app (écran de Preview, badge…).
 * Renseignées automatiquement par le pipeline de déploiement (Vercel / GitHub
 * Actions) et retombant sur des valeurs « locales » en développement.
 */
const build = {
  version: pkg.version,
  branch: env.KOS_BRANCH || env.VERCEL_GIT_COMMIT_REF || 'local',
  commit: (env.KOS_SHA || env.VERCEL_GIT_COMMIT_SHA || 'dev').slice(0, 7),
  builtAt: new Date().toISOString(),
  // Chrome « Preview » (écran d'accueil + badge) : actif hors production.
  preview:
    env.KOS_PREVIEW === '1' || env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'development',
  // production · staging · preview · local — renseigné par l'intégration Git de
  // Vercel (VERCEL_ENV) ou explicitement par le pipeline (KOS_CHANNEL).
  channel: env.KOS_CHANNEL || env.VERCEL_ENV || 'local',
};

export default defineConfig({
  plugins: [react()],
  define: {
    __KOS_BUILD__: JSON.stringify(build),
  },
  server: { port: 5175 },
});
