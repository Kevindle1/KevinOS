import type { ToolDefinition } from './ai-provider.js';

/**
 * Contrat du domaine « documents » — KOS Drive (ADR-0005 / ADR-0012), **calqué
 * sur `MediaLibrary`** (KOS Media) et `PhotoLibrary` (KOS Vision). Types
 * **agnostiques du moteur** : aucun détail de Nextcloud ni du système de
 * fichiers. KAI, Home, mobile et l'API publique ne connaissent que ce contrat
 * (Règle 3). Remplacer le moteur = réécrire l'adaptateur, pas ce fichier.
 *
 * L'objectif n'est **pas** un explorateur de fichiers : c'est une **expérience
 * documentaire pilotée par KAI** — on retrouve une information, on ne navigue
 * pas dans des dossiers.
 */

export type DriveItemKind = 'folder' | 'file';

/**
 * Nature d'un document (pour l'icône, l'aperçu et la recherche par type).
 * `other` = binaire non prévisualisable en ligne.
 */
export type DocKind =
  | 'pdf'
  | 'image'
  | 'markdown'
  | 'text'
  | 'csv'
  | 'json'
  | 'code'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'other';

/** Un élément du Drive — dossier ou fichier, **agnostique du moteur**. */
export interface DriveItem {
  id: string;
  kind: DriveItemKind;
  name: string;
  /** Chemin lisible (fil d'Ariane) — jamais un chemin disque du moteur. */
  path: string;
  /** Dossier parent (`null` = racine). */
  parentId: string | null;
  /** ISO 8601 — dernière modification. */
  modifiedAt: string;
  /** Taille en octets (`null` pour un dossier). */
  sizeBytes: number | null;
  /** **Métadonnées possédées par KevinOS** (pas par le moteur). */
  favorite: boolean;
  shared: boolean;
  trashed: boolean;
  tags: string[];
  /** Fichiers uniquement : nature du document. */
  docKind?: DocKind;
  mimeType?: string | null;
  /** Dossiers uniquement : nombre d'éléments. */
  childCount?: number;
  /**
   * Extrait de contenu indexé (recherche plein-texte). Prépare l'**OCR** :
   * demain, images et PDF scannés alimenteront ce champ via un `OcrIndexer`.
   */
  excerpt?: string | null;
}

/** Mode d'aperçu — **on reste dans KevinOS**, jamais de téléchargement forcé. */
export type PreviewMode = 'text' | 'image' | 'pdf' | 'download';

/**
 * Aperçu d'un document — l'URL pointe vers le **Core** (`/api/v1/drive/:id/raw`),
 * jamais vers le moteur. Pour les formats texte, le contenu est inline
 * (`text`) afin d'éviter un aller-retour. Les formats bureautiques (Word,
 * Excel, PowerPoint) retombent sur `download` en V1 — la conversion serveur est
 * une étape suivante (le contrat la prévoit déjà).
 */
export interface DrivePreview {
  id: string;
  name: string;
  docKind: DocKind;
  mimeType: string;
  mode: PreviewMode;
  /** URL du Core pour `image` / `pdf` / `download`. */
  url: string;
  /** Contenu inline pour `text` (markdown, csv, json, code, texte). */
  text?: string;
}

/**
 * Recherche intelligente — **la fonctionnalité principale**. Par nom, contenu,
 * date, type, taille, auteur, dossier. Le langage naturel est traduit en cette
 * requête structurée par KAI (`parseDriveIntent`).
 */
export interface DriveSearchQuery {
  /** Texte libre (nom et, si `content`, contenu indexé). */
  text?: string;
  /** Chercher aussi dans le **contenu** (extraction / OCR). */
  content?: boolean;
  docKind?: DocKind;
  /** Restreindre à un dossier. */
  folderId?: string;
  /** ISO 8601 — modifié après / avant. */
  modifiedAfter?: string;
  modifiedBefore?: string;
  minSizeBytes?: number;
  author?: string;
}

/** Entrée d'historique (versions d'un document). */
export interface DriveHistoryEntry {
  versionId: string;
  modifiedAt: string;
  sizeBytes: number;
  label?: string;
}

/**
 * Port `DriveLibrary` : l'interface stable qu'implémente tout moteur documentaire.
 * Adaptateur V1 : `LocalFsDriveAdapter implements DriveLibrary` (le système de
 * fichiers est le moteur, **caché** derrière ce contrat). Demain :
 * `NextcloudDriveAdapter`, sans toucher à KAI ni à Home.
 */
export interface DriveLibrary {
  /** Le moteur est-il joignable ? (readiness / mode dégradé). */
  isAvailable(signal?: AbortSignal): Promise<boolean>;

  /** Contenu d'un dossier (`undefined` = racine). */
  list(folderId?: string, signal?: AbortSignal): Promise<DriveItem[]>;

  getItem(id: string, signal?: AbortSignal): Promise<DriveItem>;

  /** Recherche intelligente (nom / contenu / type / date / taille / dossier). */
  search(query: DriveSearchQuery, signal?: AbortSignal): Promise<DriveItem[]>;

  /** Documents récents (les plus récemment modifiés d'abord). */
  recent(limit?: number, signal?: AbortSignal): Promise<DriveItem[]>;

  /** Fichiers les plus volumineux (« quels sont les fichiers les plus gros ? »). */
  largest(limit?: number, signal?: AbortSignal): Promise<DriveItem[]>;

  favorites(signal?: AbortSignal): Promise<DriveItem[]>;
  shared(signal?: AbortSignal): Promise<DriveItem[]>;
  trash(signal?: AbortSignal): Promise<DriveItem[]>;

  /** Aperçu (mode + URL Core + éventuel texte inline). Jamais l'URL du moteur. */
  preview(id: string, signal?: AbortSignal): Promise<DrivePreview>;

  createFolder(parentId: string | null, name: string, signal?: AbortSignal): Promise<DriveItem>;
  rename(id: string, name: string, signal?: AbortSignal): Promise<DriveItem>;
  move(id: string, targetFolderId: string | null, signal?: AbortSignal): Promise<DriveItem>;
  copy(id: string, targetFolderId: string | null, signal?: AbortSignal): Promise<DriveItem>;
  /** Mettre à la corbeille (réversible). */
  remove(id: string, signal?: AbortSignal): Promise<void>;
  restore(id: string, signal?: AbortSignal): Promise<DriveItem>;

  /** Métadonnées **possédées par KevinOS** (favoris, étiquettes). */
  setFavorite(id: string, favorite: boolean, signal?: AbortSignal): Promise<DriveItem>;
  setTags(id: string, tags: string[], signal?: AbortSignal): Promise<DriveItem>;

  history(id: string, signal?: AbortSignal): Promise<DriveHistoryEntry[]>;
}

/** Correspondance extension → nature de document (partagée moteur + Home). */
const DOC_KIND_BY_EXT: Record<string, DocKind> = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  heic: 'image',
  md: 'markdown',
  markdown: 'markdown',
  txt: 'text',
  log: 'text',
  rtf: 'text',
  csv: 'csv',
  tsv: 'csv',
  json: 'json',
  js: 'code',
  ts: 'code',
  tsx: 'code',
  jsx: 'code',
  py: 'code',
  rs: 'code',
  go: 'code',
  java: 'code',
  c: 'code',
  h: 'code',
  cpp: 'code',
  css: 'code',
  html: 'code',
  yml: 'code',
  yaml: 'code',
  sh: 'code',
  doc: 'word',
  docx: 'word',
  odt: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ods: 'excel',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
  odp: 'powerpoint',
};

/** Nature d'un document d'après son nom de fichier. */
export function docKindFromName(name: string): DocKind {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
  return DOC_KIND_BY_EXT[ext] ?? 'other';
}

/** Le contenu de cette nature est-il du texte affichable inline ? */
export function isTextDoc(kind: DocKind): boolean {
  return (
    kind === 'text' || kind === 'markdown' || kind === 'csv' || kind === 'json' || kind === 'code'
  );
}

/** Mode d'aperçu par défaut pour une nature de document. */
export function previewModeFor(kind: DocKind): PreviewMode {
  if (kind === 'image') return 'image';
  if (kind === 'pdf') return 'pdf';
  if (isTextDoc(kind)) return 'text';
  return 'download';
}

/**
 * Outils exposés à KAI pour piloter KOS Drive en langage naturel. KAI choisit
 * l'outil ; le Core l'exécute via le port `DriveLibrary`. KAI ne parle JAMAIS à
 * Nextcloud ni au système de fichiers directement (Règle 5).
 */
export const driveTools: ToolDefinition[] = [
  {
    name: 'drive.find',
    description: 'Retrouver et ouvrir un document (« ouvre mon bail »).',
    parameters: {
      type: 'object',
      required: ['text'],
      properties: { text: { type: 'string', description: 'Ex. « facture EDF ».' } },
    },
  },
  {
    name: 'drive.search',
    description: 'Rechercher des documents (nom, contenu, type, date).',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        docKind: { type: 'string', description: 'pdf, word, excel, image…' },
      },
    },
  },
  {
    name: 'drive.recent',
    description: 'Documents récents (« ouvre mon dernier document »).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'drive.largest',
    description: 'Fichiers les plus volumineux.',
    parameters: { type: 'object', properties: {} },
  },
];
