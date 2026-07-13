import type { ToolDefinition } from './ai-provider.js';

/**
 * Contrat du domaine « photos » — KOS Vision (ADR-0005 / ADR-0012).
 *
 * Ces types sont **agnostiques du moteur** : ils n'exposent AUCUN détail
 * d'Immich. Le Dashboard, KAI, l'app mobile et l'API publique ne connaissent que
 * ce contrat (Règle 3 — API-first). Remplacer Immich = réécrire l'adaptateur, pas
 * ce fichier ni ses consommateurs.
 */

export type PhotoKind = 'image' | 'video';

export interface PhotoItem {
  /** Identifiant opaque (côté KevinOS ; le mapping vers le moteur est interne). */
  id: string;
  /** Date de prise de vue (ISO 8601) ou null si inconnue. */
  takenAt: string | null;
  kind: PhotoKind;
  favorite: boolean;
  /** URL de la miniature, servie par le Core (jamais l'URL du moteur). */
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
}

export interface PhotoPage {
  items: PhotoItem[];
  /** Curseur d'itération ; null s'il n'y a plus de page. */
  nextCursor: string | null;
}

export interface Album {
  id: string;
  title: string;
  photoCount: number;
  coverPhotoId: string | null;
}

export interface AlbumDetail {
  album: Album;
  photos: PhotoItem[];
}

export interface Person {
  id: string;
  /** Nom attribué, ou null si la personne n'est pas encore nommée. */
  name: string | null;
  photoCount: number;
  thumbnailUrl: string | null;
}

export interface Memory {
  id: string;
  title: string;
  /** Date associée au souvenir (ISO 8601). */
  date: string;
  photos: PhotoItem[];
}

export interface MapPoint {
  photoId: string;
  lat: number;
  lng: number;
}

export interface LibraryUsage {
  photoCount: number;
  videoCount: number;
  /** Espace occupé par la photothèque, en octets. */
  usedBytes: number;
}

export interface BrowseParams {
  cursor?: string | null;
  limit?: number;
}

export interface PhotoSearchQuery {
  /** Recherche en langage naturel / plein texte. */
  text: string;
  personIds?: string[];
  /** Bornes temporelles (ISO 8601). */
  from?: string;
  to?: string;
  limit?: number;
}

/**
 * Port `PhotoLibrary` : l'interface stable qu'implémente tout moteur de photos.
 * Adaptateur V1 : `ImmichPhotoAdapter implements PhotoLibrary`.
 */
export interface PhotoLibrary {
  /** Le moteur est-il joignable ? (readiness / mode dégradé). */
  isAvailable(signal?: AbortSignal): Promise<boolean>;

  /** Parcourir la photothèque (timeline paginée). */
  browse(params: BrowseParams, signal?: AbortSignal): Promise<PhotoPage>;

  /** Rechercher des photos. */
  search(query: PhotoSearchQuery, signal?: AbortSignal): Promise<PhotoItem[]>;

  listAlbums(signal?: AbortSignal): Promise<Album[]>;
  getAlbum(id: string, signal?: AbortSignal): Promise<AlbumDetail>;

  /** Personnes reconnues. */
  listPeople(signal?: AbortSignal): Promise<Person[]>;

  /** Souvenirs (« il y a un an »…). */
  getMemories(signal?: AbortSignal): Promise<Memory[]>;

  /** Points géolocalisés pour la carte. */
  getMapPoints(signal?: AbortSignal): Promise<MapPoint[]>;

  /** Espace occupé et compteurs. */
  getUsage(signal?: AbortSignal): Promise<LibraryUsage>;
}

/**
 * Outils exposés à KAI (KOS Brain) pour piloter KOS Vision en langage naturel.
 * KAI choisit un outil et ses paramètres ; le Core l'exécute via le port
 * ci-dessus. KAI ne parle JAMAIS à Immich directement (Règle 5).
 *
 * Exemples d'intentions → outils :
 *  - « Montre-moi les photos des vacances 2024 »      → photos.search
 *  - « Retrouve les photos de ma fille »              → photos.listPeople + photos.search
 *  - « Quelles sont les dernières photos ? »          → photos.browse
 *  - « Combien d'espace occupent mes photos ? »       → photos.usage
 */
export const photoTools: ToolDefinition[] = [
  {
    name: 'photos.browse',
    description: 'Parcourir les photos les plus récentes (timeline paginée).',
    parameters: {
      type: 'object',
      properties: {
        cursor: { type: 'string', description: 'Curseur de pagination (optionnel).' },
        limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
      },
    },
  },
  {
    name: 'photos.search',
    description: 'Rechercher des photos par description en langage naturel, personnes et/ou dates.',
    parameters: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', description: 'Ex. « plage vacances 2024 ».' },
        personIds: { type: 'array', items: { type: 'string' } },
        from: { type: 'string', description: 'Date min (ISO 8601).' },
        to: { type: 'string', description: 'Date max (ISO 8601).' },
        limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
      },
    },
  },
  {
    name: 'photos.listAlbums',
    description: 'Lister les albums.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'photos.listPeople',
    description: 'Lister les personnes reconnues (pour ensuite filtrer une recherche).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'photos.memories',
    description: 'Obtenir les souvenirs du moment.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'photos.usage',
    description: "Connaître l'espace occupé et le nombre de photos/vidéos.",
    parameters: { type: 'object', properties: {} },
  },
];
