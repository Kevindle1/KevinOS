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
  label: 'Le lecteur officiel KevinOS',
  items: [
    'Dis « continue mon film » → fiche immersive, puis le lecteur KevinOS démarre',
    'Le lecteur officiel : lecture, sous-titres, vitesse, plein écran, PiP, clavier',
    'La reprise appartient à KevinOS — tu reprends exactement où tu t’étais arrêté',
    'KAI télécommande : « recule de 30 secondes », « sous-titres français », « ferme »',
    'Aucune trace du moteur : jamais d’onglet, jamais d’interface Jellyfin',
  ],
};
