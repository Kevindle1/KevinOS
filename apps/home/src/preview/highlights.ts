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
  label: 'Phase 2 — KOS Vision, la première compétence',
  items: [
    'Demande « montre-moi mes photos » → KAI ouvre la galerie, dans Home',
    'Recherche en langage naturel : « photos de juillet », « à la montagne »…',
    'Ouvre une photo en plein écran (visionneuse), reviens naturellement',
    'KAI pense en compétences (Skills), pas en applications',
    'Ici la galerie est simulée (démo) ; connecté à un Core, ce sont tes vraies photos',
  ],
};
