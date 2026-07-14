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
  label: 'KOS Drive — retrouve, n’explore plus',
  items: [
    'Dis « ouvre mon bail » → KAI retrouve le document et l’ouvre dans KevinOS',
    '« Les documents contenant Crédit Agricole » → recherche par contenu',
    'Aperçu direct : PDF, images, texte, markdown, CSV — sans quitter KevinOS',
    'Renommer, déplacer, télécharger, mettre en favori — sans explorateur système',
    'Le moteur reste caché : ni Nextcloud, ni système de fichiers visibles',
  ],
};
