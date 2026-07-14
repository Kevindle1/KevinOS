import { z } from 'zod';
import type { DocKind } from './drive.js';

/**
 * Contrats publics de **KAI** — le point d'entrée unique de KevinOS (Règle 5,
 * API-first Règle 3). Home, une future app mobile ou une API publique consomment
 * **exactement** ces types. KAI ne parle qu'à des **contrats** ; il ne connaît
 * jamais l'implémentation d'un module ni le fournisseur IA sous-jacent.
 */

/** D'où vient la réponse : capacité déterministe, modèle IA, ou repli. */
export type KaiReplySource = 'capability' | 'model' | 'fallback';

/**
 * Les **compétences** (Skills) de KAI. L'utilisateur ne manipule pas des
 * « modules » : il demande à KAI d'accomplir une tâche, et KAI **invoque une
 * compétence**. Chaque compétence s'appuie sur un module KOS (moteur caché,
 * remplaçable) : 📷 photos → KOS Vision, 🎬 media → KOS Media, etc.
 */
export type KaiSkillId = 'photos' | 'media' | 'drive' | 'home';

/** Intention photo structurée, extraite du langage naturel par KAI. */
export interface KaiPhotoQuery {
  /** `timeline` = dernières photos ; `search` = recherche par texte. */
  kind: 'timeline' | 'search';
  /** Texte de recherche (si `kind = 'search'`). */
  text?: string;
}

/** Intention média structurée. */
export interface KaiMediaQuery {
  /** `continue` = reprendre ; `library` = films ; `series` ; `search`. */
  kind: 'continue' | 'library' | 'series' | 'search';
  /** Texte de recherche (si `kind = 'search'`). */
  text?: string;
}

/**
 * Intention documentaire structurée (KOS Drive). L'utilisateur ne navigue pas :
 * il **retrouve une information**. `find` = ouvrir **le** document trouvé
 * (« ouvre mon bail ») ; `search` = présenter une **liste** ; `recent` = dernier
 * document ; `largest` = fichiers les plus volumineux ; `favorites` / `library`.
 */
export interface KaiDriveQuery {
  kind: 'find' | 'search' | 'recent' | 'largest' | 'favorites' | 'library';
  /** Texte (nom / contenu). */
  text?: string;
  /** Filtre par nature de document (si exprimé : « les PDF… »). */
  docKind?: DocKind;
}

/**
 * Ouvre une **compétence**, éventuellement paramétrée ; Home la présente sans
 * quitter l'expérience.
 */
export interface KaiOpenSkillAction {
  type: 'open_skill';
  skill: KaiSkillId;
  /** Libellé présenté à l'utilisateur. */
  label: string;
  /** Paramètres de la compétence photos (si `skill = 'photos'`). */
  photoQuery?: KaiPhotoQuery;
  /** Paramètres de la compétence média (si `skill = 'media'`). */
  mediaQuery?: KaiMediaQuery;
  /** Paramètres de la compétence documents (si `skill = 'drive'`). */
  driveQuery?: KaiDriveQuery;
}

/** Commandes du lecteur — **KAI devient la télécommande universelle**. */
export type KaiPlayerCommandType =
  | 'play'
  | 'pause'
  | 'toggle'
  | 'seekBy'
  | 'nextEpisode'
  | 'prevEpisode'
  | 'skipIntro'
  | 'subtitles'
  | 'audio'
  | 'volumeUp'
  | 'volumeDown'
  | 'mute'
  | 'fullscreen'
  | 'close';

/** Pilotage du lecteur KevinOS en langage naturel (jamais manipulé à la main). */
export interface KaiControlPlayerAction {
  type: 'control_player';
  command: KaiPlayerCommandType;
  /** Secondes pour `seekBy` (négatif = recul). */
  amountSec?: number;
  /** Langue pour `subtitles` / `audio` (`fr`, `en`/`vo`, `off`). */
  lang?: string;
}

/** Action structurée décidée par KAI (jamais un appel direct à un moteur). */
export type KaiAction = KaiOpenSkillAction | KaiControlPlayerAction;

const NUMBER_WORDS: Record<string, number> = {
  une: 1,
  un: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  dix: 10,
  quinze: 15,
  vingt: 20,
  trente: 30,
  quarante: 40,
  cinquante: 50,
  soixante: 60,
};

function amountFrom(message: string): number | undefined {
  const digit = message.match(/(\d+)\s*(min|minute|m|sec|seconde|s)?/i);
  let n: number | undefined;
  let unit = '';
  if (digit) {
    n = Number(digit[1]);
    unit = (digit[2] ?? '').toLowerCase();
  } else {
    for (const [word, value] of Object.entries(NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(message)) {
        n = value;
        break;
      }
    }
    if (/\bminute/i.test(message)) unit = 'min';
  }
  if (n == null) return undefined;
  return unit.startsWith('m') && unit !== 'sec' ? n * 60 : n;
}

/**
 * Analyse une **commande de lecteur** (déterministe, hors ligne). `null` si le
 * message ne pilote pas la lecture. Partagée par le Core et le repli de Home.
 */
export function parsePlayerCommand(message: string): KaiControlPlayerAction | null {
  const m = message.toLowerCase();

  if (
    /\b(ferme|quitte|arrête|arrete|stop)\b.*\b(lecteur|vidéo|video|lecture|film|là|ça)\b/.test(m) ||
    /\bferme le lecteur\b/.test(m)
  )
    return { type: 'control_player', command: 'close' };
  if (/\b(recule|reviens|retour|arrière|arriere|reculer)\b/.test(m))
    return { type: 'control_player', command: 'seekBy', amountSec: -(amountFrom(m) ?? 10) };
  if (/\b(avance|saute|avancer)\b/.test(m))
    return { type: 'control_player', command: 'seekBy', amountSec: amountFrom(m) ?? 10 };
  if (/\bpause\b|\bmets? en pause\b/.test(m)) return { type: 'control_player', command: 'pause' };
  if (/\b(reprends|continue|joue|lance|play)\b.*\blecture\b|\blecture\b.*\breprends\b/.test(m))
    return { type: 'control_player', command: 'play' };
  if (/\b(prochain|suivant)\b.*\b[ée]pisode\b|[ée]pisode\s+suivant|passe au prochain/.test(m))
    return { type: 'control_player', command: 'nextEpisode' };
  if (/[ée]pisode\s+pr[ée]c[ée]dent|\bpr[ée]c[ée]dent\b.*[ée]pisode/.test(m))
    return { type: 'control_player', command: 'prevEpisode' };
  if (/passe l['e]?\s*intro|passe l'introduction|skip.*intro|passer l'intro/.test(m))
    return { type: 'control_player', command: 'skipIntro' };
  if (/sous-?titres?/.test(m)) {
    const off = /d[ée]sactive|coupe|sans|off|aucun/.test(m);
    const lang = off ? 'off' : /anglais|english/.test(m) ? 'en' : 'fr';
    return { type: 'control_player', command: 'subtitles', lang };
  }
  if (/\b(vo|version originale)\b|passe en vo/.test(m))
    return { type: 'control_player', command: 'audio', lang: 'en' };
  if (/piste audio|\baudio\b.*(français|francais|anglais)/.test(m))
    return { type: 'control_player', command: 'audio', lang: /anglais/.test(m) ? 'en' : 'fr' };
  if (/\b(augmente|monte|plus fort)\b.*\b(son|volume)\b|monte le volume/.test(m))
    return { type: 'control_player', command: 'volumeUp' };
  if (/\b(baisse|diminue|moins fort)\b.*\b(son|volume)\b/.test(m))
    return { type: 'control_player', command: 'volumeDown' };
  if (/\b(coupe|muet|silence)\b.*\b(son|volume)?\b|\bmute\b/.test(m))
    return { type: 'control_player', command: 'mute' };
  if (/plein[- ]?[ée]cran|fullscreen/.test(m))
    return { type: 'control_player', command: 'fullscreen' };

  return null;
}

/**
 * Analyse une intention **photo** en langage naturel (déterministe, hors ligne).
 * Renvoie `null` si le message ne concerne pas les photos. Source de vérité
 * partagée par le Core (compétence KAI) et le repli hors-ligne de Home.
 */
export function parsePhotoIntent(message: string): KaiPhotoQuery | null {
  if (!/\b(photo|photos|image|images|album|albums|selfie|clich[ée]s?)\b/i.test(message)) {
    return null;
  }
  if (/\b(derni[èe]re?s?|r[ée]cent(?:e|s|es)?|nouvelles?)\b/i.test(message)) {
    return { kind: 'timeline' };
  }
  const text = message
    .replace(/montre(?:-moi)?|affiche|recherche|cherche|trouve|ouvre|regarde|voir/gi, ' ')
    .replace(/\b(les?|des?|du|mes|ma|mon|the|une?)\b/gi, ' ')
    .replace(/\bphotos?\b|\bimages?\b|\balbums?\b|\bclich[ée]s?\b/gi, ' ')
    .replace(/o[uù] appara[îi]t|qui appara[îi]t|avec|prises?|à la|à l'|au[xy]?|en |dans /gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length >= 2 ? { kind: 'search', text } : { kind: 'timeline' };
}

/**
 * Analyse une intention **média** (déterministe, hors ligne). `null` si le
 * message ne concerne pas les films/séries. Partagée par le Core (compétence
 * KAI) et le repli hors-ligne de Home.
 */
export function parseMediaIntent(message: string): KaiMediaQuery | null {
  if (
    !/\b(film|films|s[ée]rie|s[ée]ries|m[ée]dia|media|regarder|cin[ée]ma|[ée]pisode|saison|collection)\b/i.test(
      message,
    )
  ) {
    return null;
  }
  if (/\b(continue|continuer|reprend(?:re|s)?|reprise)\b/i.test(message)) {
    return { kind: 'continue' };
  }
  if (/\bs[ée]ries?\b/i.test(message)) {
    return { kind: 'series' };
  }
  const text = message
    .replace(/montre(?:-moi)?|affiche|recherche|cherche|trouve|ouvre|regarde|lance|voir/gi, ' ')
    .replace(/\b(les?|des?|du|mes|ma|mon|the|une?|le|la)\b/gi, ' ')
    .replace(/\bfilms?\b|\bs[ée]ries?\b|\bm[ée]dias?\b|\bcin[ée]ma\b|\bcollections?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length >= 2 ? { kind: 'search', text } : { kind: 'library' };
}

/** Natures de documents détectables dans le langage naturel. */
const DOC_KIND_WORDS: Array<[RegExp, DocKind]> = [
  [/\bpdf\b/i, 'pdf'],
  [/\b(word|docx?|traitement de texte)\b/i, 'word'],
  [/\b(excel|tableur|xlsx?|feuille de calcul)\b/i, 'excel'],
  [/\b(powerpoint|pptx?|présentation|presentation|diaporama)\b/i, 'powerpoint'],
  [/\b(image|images|photo scann[ée]e?|scan)\b/i, 'image'],
  [/\b(csv|tableau)\b/i, 'csv'],
  [/\b(markdown|\.md)\b/i, 'markdown'],
];

/** Mots qui **déclenchent** la compétence documents (au-delà de « document »). */
const DRIVE_TRIGGER =
  /\b(document|documents|fichier|fichiers|dossier|dossiers|drive|pdf|word|excel|powerpoint|tableur|bail|facture|factures|contrat|contrats|cv|relev[ée]|attestation|quittance|devis|bulletin|fiche de paie|imp[ôo]ts?|assurance|justificatif|mandat|avis)\b/i;

/**
 * Analyse une intention **documentaire** (déterministe, hors ligne). `null` si
 * le message ne concerne pas les documents. Partagée par le Core (compétence
 * KAI) et le repli hors-ligne de Home. Ne surtout pas voler « ouvre mon film » :
 * les compétences média/photos passent **avant** dans l'ordre des skills.
 */
export function parseDriveIntent(message: string): KaiDriveQuery | null {
  if (!DRIVE_TRIGGER.test(message)) return null;
  const m = message.toLowerCase();

  const docKind = DOC_KIND_WORDS.find(([re]) => re.test(message))?.[1];

  // Vues et tris explicites d'abord.
  if (/\b(volumineux|volumineuses|gros|grosses|lourds?|lourdes?|plus grand|plus gros)\b/.test(m)) {
    return docKind ? { kind: 'largest', docKind } : { kind: 'largest' };
  }
  if (/\bfavoris?\b|favories?/.test(m)) return { kind: 'favorites' };
  if (
    /\b(dernier|derni[èe]re|derniers|derni[èe]res|plus r[ée]cent(?:e|s|es)?)\b/.test(m) &&
    !/contenant|concernant|parlent|parle/.test(m)
  ) {
    return { kind: 'recent' };
  }

  const text = extractDriveText(message);

  // « recherche / tous les / quels / contenant / concernant » → liste.
  const wantsList =
    /\b(recherche|cherche|liste|tous|toutes|quels|quelles|montre-moi tous|montre-moi toutes)\b/.test(
      m,
    ) ||
    /contenant|concernant|parlent de|parle de|qui parlent|qui parle/.test(m) ||
    /\bdocuments\b|\bfichiers\b/.test(m);

  if (wantsList) {
    const q: KaiDriveQuery = { kind: 'search' };
    if (text) q.text = text;
    if (docKind) q.docKind = docKind;
    // Liste sans critère → bibliothèque.
    if (!q.text && !q.docKind) return { kind: 'library' };
    return q;
  }

  // Sinon : retrouver **le** document et l'ouvrir (« ouvre mon bail »).
  if (!text && !docKind) return { kind: 'library' };
  const found: KaiDriveQuery = { kind: 'find' };
  if (text) found.text = text;
  if (docKind) found.docKind = docKind;
  return found;
}

/** Extrait le cœur de la requête documentaire (retire verbes, articles, bruit). */
function extractDriveText(message: string): string {
  return message
    .replace(
      /montre(?:-moi)?|affiche|recherche|cherche|retrouve|trouve|ouvre|donne(?:-moi)?|o[uù] est|o[uù] sont|quels?|quelles?|liste/gi,
      ' ',
    )
    .replace(
      /contenant|concernant|qui parlent de|qui parle de|parlent de|parle de|au sujet de/gi,
      ' ',
    )
    .replace(/\b(le|la|les|un|une|des|du|de|mon|ma|mes|tous|toutes|ce|cette|mien|the)\b/gi, ' ')
    .replace(
      /\b(document|documents|fichier|fichiers|dossier|dossiers|drive|pdf|concernent|concerne)\b/gi,
      ' ',
    )
    .replace(/[?!.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Un tour de conversation entrant. */
export interface KaiTurnRequest {
  message: string;
}

/** La réponse de KAI. */
export interface KaiReply {
  text: string;
  source: KaiReplySource;
  /** Actions proposées (ex. ouvrir KOS Vision). */
  actions?: KaiAction[];
}

/** Validation de la requête entrante (fail-fast côté Core). */
export const kaiTurnRequestSchema = z.object({
  message: z.string().min(1).max(4000),
});
