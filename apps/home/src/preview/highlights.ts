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
  label: 'KOS Home — la maison orchestrée par KAI',
  items: [
    'Dis « active le mode cinéma » → volets baissés, lumières tamisées, TV allumée',
    '…puis « continue mon film » → KOS Media reprend (les compétences collaborent)',
    '« Allume la lumière du salon », « ferme les volets », « ouvre le portail »',
    '« Quelle est la température ? », « qui est à la maison ? », « ma consommation »',
    'Ambiances, caméras, énergie, présence — sans tableau de bord technique',
  ],
};
