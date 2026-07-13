/**
 * Informations de build injectées par Vite (`define`) — voir `vite.config.ts`.
 * Toujours défini au runtime ; typé ici pour l'accès depuis le code.
 */
declare const __KOS_BUILD__: {
  version: string;
  branch: string;
  commit: string;
  builtAt: string;
  preview: boolean;
  channel: string;
};
