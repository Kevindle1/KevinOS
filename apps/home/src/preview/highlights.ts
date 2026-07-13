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
  label: 'Itération 1 — l’accueil KAI-first',
  items: [
    'Home — le premier écran de KevinOS, centré sur KAI',
    'Zone de conversation (KAI simulé) avec suggestions',
    'Nouveau composant PromptInput (@kevinos/ui)',
    'Thème clair / sombre / système',
    'Environnement de Preview déployé automatiquement',
  ],
};
