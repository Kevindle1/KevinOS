/**
 * Nouveautés mises en avant sur l'**écran d'accueil de la Preview**.
 *
 * Liste **curée à la main** (honnête et lisible), mise à jour à chaque itération
 * — cf. HOME_EXPERIENCE §4 : on ne montre que du vrai. C'est le « changelog du
 * produit » vu par l'utilisateur, pas le journal technique.
 */
export interface PreviewHighlights {
  /** Étiquette de la version (affichée à côté du numéro). */
  label: string;
  /** Les nouveautés visibles par l'utilisateur, les plus marquantes d'abord. */
  items: string[];
}

export const PREVIEW_HIGHLIGHTS: PreviewHighlights = {
  label: 'Phase KAI — une vraie IA commence',
  items: [
    'Le vrai KAI arrive côté serveur : heure, date, état système, ouvrir un module',
    'IA 100 % locale (Ollama), fournisseurs interchangeables, offline-first',
    'Home se connecte au vrai KAI quand un Core tourne',
    'Cette Preview reste simulée (pas de backend) — mais l’architecture est réelle',
    'Accueil « curation » figé : l’essentiel, maintenant',
  ],
};
