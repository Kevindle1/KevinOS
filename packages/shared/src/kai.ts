import { z } from 'zod';
import type { DocKind } from './drive.js';
import type { HomeCommandType, HomeDeviceKind } from './home.js';

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
 * Intention **maison** structurée (KOS Home) — ce que KAI **montre** quand on
 * l'interroge (température, présence, caméras, énergie…). Le **pilotage** passe,
 * lui, par `KaiControlHomeAction` (comme la télécommande du lecteur).
 */
export interface KaiHomeQuery {
  kind: 'overview' | 'room' | 'lights' | 'cameras' | 'energy' | 'presence' | 'climate';
  /** Pièce ciblée (nom lisible). */
  room?: string;
  text?: string;
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
  /** Paramètres de la compétence maison (si `skill = 'home'`). */
  homeQuery?: KaiHomeQuery;
}

/**
 * Pilotage de la **maison** en langage naturel (KOS Home) — jamais d'entités ni
 * d'automatismes manipulés à la main. Même esprit que la télécommande du lecteur.
 */
export interface KaiControlHomeAction {
  type: 'control_home';
  command: HomeCommandType;
  /** Type d'appareil visé (light, cover, door…). */
  deviceKind?: HomeDeviceKind;
  /** Pièce visée (nom lisible ; absent = toute la maison). */
  room?: string;
  /** Ambiance à activer (si `command = 'activate_scene'`). */
  scene?: string;
  /** Valeur (luminosité %, température °C). */
  value?: number;
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
export type KaiAction = KaiOpenSkillAction | KaiControlPlayerAction | KaiControlHomeAction;

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
  // Une **ambiance** maison (« active le mode cinéma ») n'est pas une recherche
  // de film : on laisse la main à KOS Home.
  if (
    /\b(ambiance|sc[èe]ne)\b/i.test(message) ||
    /\bmode\s+(cin[ée]ma|lecture|nuit|travail|d[îi]ner|soir[ée]e|jour)\b/i.test(message)
  ) {
    return null;
  }
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

/** Résultat de l'analyse maison : soit un **pilotage**, soit une **question**. */
export type KaiHomeIntent = { control: KaiControlHomeAction } | { view: KaiHomeQuery };

/** Pièces reconnues dans le langage naturel (extraction de `room`). */
const ROOMS: Array<[RegExp, string]> = [
  [/\bsalon\b|\bs[ée]jour\b/i, 'Salon'],
  [/\bcuisine\b/i, 'Cuisine'],
  [/\bchambre\b/i, 'Chambre'],
  [/\bbureau\b/i, 'Bureau'],
  [/\bgarage\b/i, 'Garage'],
  [/\bentr[ée]e\b/i, 'Entrée'],
  [/\bsalle de bain[s]?\b/i, 'Salle de bain'],
  [/\bjardin\b/i, 'Jardin'],
  [/\bterrasse\b/i, 'Terrasse'],
];
function roomFrom(message: string): string | undefined {
  return ROOMS.find(([re]) => re.test(message))?.[1];
}

/** Ambiances reconnues. Certaines s'activent seules (« bonne nuit »). */
const SCENES: Array<[RegExp, string, boolean]> = [
  [/\bcin[ée]ma\b/i, 'cinema', false],
  [/\blecture\b/i, 'lecture', false],
  [/\b(bonne nuit|bonne-nuit|dodo|coucher)\b/i, 'bonne_nuit', true],
  [/\b(bonjour|r[ée]veil|debout)\b/i, 'bonjour', true],
  [/\bje rentre\b|\bde retour\b|\bà la maison\b/i, 'je_rentre', false],
  [/\bje pars\b|je m'en vais|\bd[ée]part\b/i, 'je_pars', true],
  [/\btravail\b|\bconcentration\b|\bfocus\b/i, 'travail', false],
  [/\bd[îi]ner\b|\brepas\b|\bà table\b/i, 'diner', false],
];
function sceneFrom(m: string): string | null {
  const activated = /\b(ambiance|sc[èe]ne|mode|active|enclenche|lance|d[ée]marre|passe en)\b/i.test(
    m,
  );
  for (const [re, id, standalone] of SCENES) {
    if (re.test(m) && (standalone || activated)) return id;
  }
  return null;
}

const HOME_TRIGGER =
  /\b(lumi[èe]res?|lampe|lampes|[ée]clairage|prises?|volets?|stores?|portail|porte|portes|cam[ée]ras?|temp[ée]rature|chauffage|thermostat|climat|consommation|consomm[ée]|[ée]lectricit[ée]|watt|kwh|pr[ée]sence|pr[ée]sent|maison|domotique|appareils?)\b/i;

/**
 * Analyse une intention **maison** (déterministe, hors ligne). `null` si le
 * message ne concerne pas la maison. Renvoie soit un **pilotage**
 * (`control_home`) soit une **question** (`KaiHomeQuery`). Partagée par le Core
 * (compétence KAI) et le repli hors-ligne de Home.
 */
export function parseHomeIntent(message: string): KaiHomeIntent | null {
  const m = message.toLowerCase();

  // 1) Ambiances (« active le mode cinéma », « bonne nuit »).
  const scene = sceneFrom(m);
  if (scene) return { control: { type: 'control_home', command: 'activate_scene', scene } };

  if (!HOME_TRIGGER.test(message)) return null;
  const room = roomFrom(message);

  // 2) Pilotage d'appareils.
  const control = parseHomeControl(m, room);
  if (control) return { control };

  // 3) Questions → une vue.
  const view = parseHomeView(m, room);
  return { view };
}

function numFrom(m: string): number | undefined {
  const d = m.match(/(\d{1,3})\s*(?:%|°|degr[ée]s?)?/);
  return d ? Number(d[1]) : undefined;
}

function parseHomeControl(m: string, room?: string): KaiControlHomeAction | null {
  const base = (extra: Partial<KaiControlHomeAction>): KaiControlHomeAction => ({
    type: 'control_home',
    command: 'turn_on',
    ...(room ? { room } : {}),
    ...extra,
  });
  // ⚠ `\b` est une frontière ASCII : elle échoue devant « é ». On évite donc
  // `\b` juste avant une voyelle accentuée (« éteins »).
  const turnOff = /(?:^|\s|')([ée]teins|eteins|[ée]teindre|coupe|arr[êe]te)/.test(m);
  const turnOn = /\b(allume|allumer|allumez)\b/.test(m);
  const opening = /\b(ouvre|ouvrir|monte|remonte|l[èe]ve|d[ée]verrouille)\b/.test(m);
  const closing = /\b(ferme|fermer|baisse|descends|abaisse|verrouille)\b/.test(m);

  // Volets / stores.
  if (/\bvolets?\b|\bstores?\b/.test(m))
    return base({ command: closing ? 'close' : 'open', deviceKind: 'cover' });
  // Portail / porte.
  if (/\bportail\b|\bportes?\b/.test(m))
    return base({ command: opening ? 'open' : 'close', deviceKind: 'door' });
  const value = numFrom(m);
  const valuePart = value != null ? { value } : {};
  // Chauffage / thermostat.
  if (
    /\bchauffage\b|\bthermostat\b|\btemp[ée]rature\b/.test(m) &&
    (turnOn || turnOff || /\br[èe]gle|\bmets|\bmonte|\bbaisse|\d/.test(m)) &&
    !/\bquelle\b|\bcombien\b|\?/.test(m)
  )
    return base({ command: 'set_temperature', deviceKind: 'thermostat', ...valuePart });
  // Prises.
  if (/\bprises?\b/.test(m))
    return base({ command: turnOff ? 'turn_off' : 'turn_on', deviceKind: 'plug' });
  // Lumières.
  if (/\blumi[èe]res?\b|\blampe|[ée]clairage\b/.test(m)) {
    if (/\d\s*%/.test(m))
      return base({ command: 'set_brightness', deviceKind: 'light', ...valuePart });
    if (turnOff) return base({ command: 'turn_off', deviceKind: 'light' });
    if (turnOn) return base({ command: 'turn_on', deviceKind: 'light' });
  }
  return null;
}

function parseHomeView(m: string, room?: string): KaiHomeQuery {
  const withRoom = (kind: KaiHomeQuery['kind']): KaiHomeQuery => (room ? { kind, room } : { kind });
  if (/devant (la porte|chez|l'entr[ée]e)|sonnette|livreur|qui est devant/.test(m))
    return withRoom('cameras');
  if (/cam[ée]ra|film[ée]|surveillance|mouvement|[ée]v[ée]nement/.test(m))
    return withRoom('cameras');
  if (
    /consommation|consomm[ée]|[ée]lectricit[ée]|kwh|watt|[ée]nergie|quelle pi[èe]ce consomme/.test(
      m,
    )
  )
    return { kind: 'energy' };
  if (/laiss[ée].*(allum|éteint)|oubli[ée].*allum|quelle.*lumi[èe]re.*allum/.test(m))
    return { kind: 'lights' };
  if (/temp[ée]rature|chauffage|il fait (combien|quelle)|\bdegr[ée]s?\b|climat/.test(m))
    return withRoom('climate');
  if (
    /qui est (l[àa]|pr[ée]sent|à la maison|chez)|pr[ée]sence|qui est absent|quelqu'un (est|à)/.test(
      m,
    )
  )
    return { kind: 'presence' };
  if (room) return { kind: 'room', room };
  return { kind: 'overview' };
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
