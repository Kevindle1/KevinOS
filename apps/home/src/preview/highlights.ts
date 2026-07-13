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
  label: 'Itération 2 — KevinOS vivant',
  items: [
    'Un accueil qui semble t’attendre — KAI présent, la journée racontée',
    'Cartes d’aperçu : photos, média à reprendre, sauvegarde, serveur, maison…',
    'Suggestions intelligentes, contextuelles',
    'Micro-interactions : halo, respiration, apparition progressive, réponses écrites',
    'KAI répond en connaissant ton environnement (simulé)',
  ],
};
