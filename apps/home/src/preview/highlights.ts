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
  label: 'Itération 3 — l’essentiel, maintenant',
  items: [
    'KAI ne montre que ce qui compte maintenant — au plus 3 cartes, jamais un mur',
    'L’accueil évolue selon le moment (matin, après-midi, soir, nuit)',
    'Système d’importance : une alerte remonte et remplace une carte',
    'Respiration : très calme, puis KevinOS « prend la parole »',
    'Mémoire : KAI se souvient (« hier tu avais commencé… »)',
  ],
};
