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
  label: 'Phase 3 — KOS Media, deuxième compétence',
  items: [
    'Dis « continue mon film » → KAI ouvre la fiche et la reprise de lecture',
    '« Montre-moi mes films / mes séries » → une vraie médiathèque, dans Home',
    'Continuer la lecture, récents, collections, recherche, fiche + progression',
    'KOS Media a été calqué sur KOS Vision — sans toucher au cœur de KAI',
    'Photos et Média fonctionnent ensemble ; ici tout est en démo (sans backend)',
  ],
};
