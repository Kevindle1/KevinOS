import type {
  KaiPhotoQuery,
  KaiMediaQuery,
  KaiDriveQuery,
  KaiHomeQuery,
  KaiHomeIntent,
  KaiControlPlayerAction,
  KaiControlHomeAction,
  DocKind,
} from '@kevinos/shared';

/**
 * Détecteur d'intention **photo** côté Home — **uniquement** pour le repli
 * hors-ligne (Preview sans Core). Le vrai KAI (Core) reste la source de vérité
 * (`parsePhotoIntent` de `@kevinos/shared`) ; on en garde ici un miroir minimal
 * pour que l'expérience « montre-moi mes photos » marche même sans backend.
 */
export function detectPhotoIntent(message: string): KaiPhotoQuery | null {
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

/** Miroir hors-ligne de `parseMediaIntent` (Core = source de vérité). */
export function detectMediaIntent(message: string): KaiMediaQuery | null {
  // Une ambiance maison (« mode cinéma ») n'est pas une recherche de film.
  if (
    /\b(ambiance|sc[èe]ne)\b/i.test(message) ||
    /\bmode\s+(cin[ée]ma|lecture|nuit|travail|d[îi]ner|soir[ée]e|jour)\b/i.test(message)
  ) {
    return null;
  }
  if (
    !/\b(film|films|s[ée]rie|s[ée]ries|serie|series|m[ée]dia|media|regarder|cin[ée]ma|[ée]pisode|saison|collection)\b/i.test(
      message,
    )
  ) {
    return null;
  }
  if (/\b(continue|continuer|reprend(?:re|s)?|reprise)\b/i.test(message))
    return { kind: 'continue' };
  if (/\bs[ée]ries?\b/i.test(message)) return { kind: 'series' };
  const text = message
    .replace(/montre(?:-moi)?|affiche|recherche|cherche|trouve|ouvre|regarde|lance|voir/gi, ' ')
    .replace(/\b(les?|des?|du|mes|ma|mon|the|une?|le|la)\b/gi, ' ')
    .replace(/\bfilms?\b|\bs[ée]ries?\b|\bm[ée]dias?\b|\bcin[ée]ma\b|\bcollections?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length >= 2 ? { kind: 'search', text } : { kind: 'library' };
}

const DRIVE_TRIGGER =
  /\b(document|documents|fichier|fichiers|dossier|dossiers|drive|pdf|word|excel|powerpoint|tableur|bail|facture|factures|contrat|contrats|cv|relev[ée]|attestation|quittance|devis|bulletin|fiche de paie|imp[ôo]ts?|assurance|justificatif|mandat|avis)\b/i;
const DOC_KIND_WORDS: Array<[RegExp, DocKind]> = [
  [/\bpdf\b/i, 'pdf'],
  [/\b(word|docx?|traitement de texte)\b/i, 'word'],
  [/\b(excel|tableur|xlsx?|feuille de calcul)\b/i, 'excel'],
  [/\b(powerpoint|pptx?|présentation|presentation|diaporama)\b/i, 'powerpoint'],
  [/\b(image|images|scan)\b/i, 'image'],
  [/\bcsv\b/i, 'csv'],
];

/** Miroir hors-ligne de `parseDriveIntent` (Core = source de vérité). */
export function detectDriveIntent(message: string): KaiDriveQuery | null {
  if (!DRIVE_TRIGGER.test(message)) return null;
  const m = message.toLowerCase();
  const docKind = DOC_KIND_WORDS.find(([re]) => re.test(message))?.[1];

  if (/\b(volumineux|volumineuses|gros|grosses|lourds?|lourdes?|plus gros|plus grand)\b/.test(m))
    return docKind ? { kind: 'largest', docKind } : { kind: 'largest' };
  if (/\bfavoris?\b|favories?/.test(m)) return { kind: 'favorites' };
  if (
    /\b(dernier|derni[èe]re|derniers|derni[èe]res|plus r[ée]cent(?:e|s|es)?)\b/.test(m) &&
    !/contenant|concernant|parlent|parle/.test(m)
  )
    return { kind: 'recent' };

  const text = message
    .replace(
      /montre(?:-moi)?|affiche|recherche|cherche|retrouve|trouve|ouvre|donne(?:-moi)?|o[uù] est|o[uù] sont|quels?|quelles?|liste/gi,
      ' ',
    )
    .replace(
      /contenant|concernant|qui parlent de|qui parle de|parlent de|parle de|au sujet de/gi,
      ' ',
    )
    .replace(/\b(le|la|les|un|une|des|du|de|mon|ma|mes|tous|toutes|ce|cette)\b/gi, ' ')
    .replace(
      /\b(document|documents|fichier|fichiers|dossier|dossiers|drive|pdf|concernent|concerne)\b/gi,
      ' ',
    )
    .replace(/[?!.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wantsList =
    /\b(recherche|cherche|liste|tous|toutes|quels|quelles)\b/.test(m) ||
    /contenant|concernant|parlent|parle/.test(m) ||
    /\bdocuments\b|\bfichiers\b/.test(m);

  if (wantsList) {
    if (!text && !docKind) return { kind: 'library' };
    const q: KaiDriveQuery = { kind: 'search' };
    if (text) q.text = text;
    if (docKind) q.docKind = docKind;
    return q;
  }
  if (!text && !docKind) return { kind: 'library' };
  const found: KaiDriveQuery = { kind: 'find' };
  if (text) found.text = text;
  if (docKind) found.docKind = docKind;
  return found;
}

const HOME_ROOMS: Array<[RegExp, string]> = [
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
const HOME_SCENES: Array<[RegExp, string, boolean]> = [
  [/\bcin[ée]ma\b/i, 'cinema', false],
  [/\blecture\b/i, 'lecture', false],
  [/\b(bonne nuit|bonne-nuit|dodo|coucher)\b/i, 'bonne_nuit', true],
  [/\b(bonjour|r[ée]veil|debout)\b/i, 'bonjour', true],
  [/\bje rentre\b|\bde retour\b|\bà la maison\b/i, 'je_rentre', false],
  [/\bje pars\b|je m'en vais|\bd[ée]part\b/i, 'je_pars', true],
  [/\btravail\b|\bconcentration\b|\bfocus\b/i, 'travail', false],
  [/\bd[îi]ner\b|\brepas\b|\bà table\b/i, 'diner', false],
];
const HOME_TRIGGER =
  /\b(lumi[èe]res?|lampe|lampes|[ée]clairage|prises?|volets?|stores?|portail|porte|portes|cam[ée]ras?|temp[ée]rature|chauffage|thermostat|climat|consommation|consomm[ée]|[ée]lectricit[ée]|watt|kwh|pr[ée]sence|pr[ée]sent|maison|domotique|appareils?)\b/i;

/** Miroir hors-ligne de `parseHomeIntent` (Core = source de vérité). */
export function detectHomeIntent(message: string): KaiHomeIntent | null {
  const m = message.toLowerCase();
  const activated = /\b(ambiance|sc[èe]ne|mode|active|enclenche|lance|d[ée]marre|passe en)\b/i.test(
    m,
  );
  for (const [re, id, standalone] of HOME_SCENES) {
    if (re.test(m) && (standalone || activated))
      return { control: { type: 'control_home', command: 'activate_scene', scene: id } };
  }
  if (!HOME_TRIGGER.test(message)) return null;
  const room = HOME_ROOMS.find(([re]) => re.test(message))?.[1];
  const control = detectHomeControl(m, room);
  if (control) return { control };
  return { view: detectHomeView(m, room) };
}

function homeNum(m: string): number | undefined {
  const d = m.match(/(\d{1,3})/);
  return d ? Number(d[1]) : undefined;
}
function detectHomeControl(m: string, room?: string): KaiControlHomeAction | null {
  const base = (extra: Partial<KaiControlHomeAction>): KaiControlHomeAction => ({
    type: 'control_home',
    command: 'turn_on',
    ...(room ? { room } : {}),
    ...extra,
  });
  const turnOff = /(?:^|\s|')([ée]teins|eteins|[ée]teindre|coupe|arr[êe]te)/.test(m);
  const turnOn = /\b(allume|allumer|allumez)\b/.test(m);
  const opening = /\b(ouvre|ouvrir|monte|remonte|l[èe]ve|d[ée]verrouille)\b/.test(m);
  const closing = /\b(ferme|fermer|baisse|descends|abaisse|verrouille)\b/.test(m);
  const value = homeNum(m);
  const valuePart = value != null ? { value } : {};

  if (/\bvolets?\b|\bstores?\b/.test(m))
    return base({ command: closing ? 'close' : 'open', deviceKind: 'cover' });
  if (/\bportail\b|\bportes?\b/.test(m))
    return base({ command: opening ? 'open' : 'close', deviceKind: 'door' });
  if (
    /\bchauffage\b|\bthermostat\b|\btemp[ée]rature\b/.test(m) &&
    (turnOn || turnOff || /r[èe]gle|mets|monte|baisse|\d/.test(m)) &&
    !/quelle|combien|\?/.test(m)
  )
    return base({ command: 'set_temperature', deviceKind: 'thermostat', ...valuePart });
  if (/\bprises?\b/.test(m))
    return base({ command: turnOff ? 'turn_off' : 'turn_on', deviceKind: 'plug' });
  if (/\blumi[èe]res?\b|\blampe|[ée]clairage\b/.test(m)) {
    if (/\d\s*%/.test(m))
      return base({ command: 'set_brightness', deviceKind: 'light', ...valuePart });
    if (turnOff) return base({ command: 'turn_off', deviceKind: 'light' });
    if (turnOn) return base({ command: 'turn_on', deviceKind: 'light' });
  }
  return null;
}
function detectHomeView(m: string, room?: string): KaiHomeQuery {
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
function amountFrom(m: string): number | undefined {
  const digit = m.match(/(\d+)\s*(min|minute|m|sec|seconde|s)?/i);
  let n: number | undefined;
  let unit = '';
  if (digit) {
    n = Number(digit[1]);
    unit = (digit[2] ?? '').toLowerCase();
  } else {
    for (const [word, value] of Object.entries(NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(m)) {
        n = value;
        break;
      }
    }
    if (/\bminute/i.test(m)) unit = 'min';
  }
  if (n == null) return undefined;
  return unit.startsWith('m') && unit !== 'sec' ? n * 60 : n;
}

/**
 * Miroir hors-ligne de `parsePlayerCommand` (Core = source de vérité) — pour que
 * la **télécommande KAI** fonctionne aussi en Preview.
 */
export function detectPlayerCommand(message: string): KaiControlPlayerAction | null {
  const m = message.toLowerCase();
  if (
    /\bferme le lecteur\b|\b(ferme|quitte|arrête|arrete|stop)\b.*\b(lecteur|vidéo|video|lecture)\b/.test(
      m,
    )
  )
    return { type: 'control_player', command: 'close' };
  if (/\b(recule|reviens|retour|arrière|arriere)\b/.test(m))
    return { type: 'control_player', command: 'seekBy', amountSec: -(amountFrom(m) ?? 10) };
  if (/\b(avance|saute)\b/.test(m))
    return { type: 'control_player', command: 'seekBy', amountSec: amountFrom(m) ?? 10 };
  if (/\bpause\b|\bmets? en pause\b/.test(m)) return { type: 'control_player', command: 'pause' };
  if (/\b(reprends|continue|joue|lance|play)\b.*\blecture\b/.test(m))
    return { type: 'control_player', command: 'play' };
  if (/(prochain|suivant)\s*[ée]?pisode|[ée]pisode\s+suivant|passe au prochain/.test(m))
    return { type: 'control_player', command: 'nextEpisode' };
  if (/passe l['e ]?\s*intro|passe l'introduction|skip.*intro/.test(m))
    return { type: 'control_player', command: 'skipIntro' };
  if (/sous-?titres?/.test(m)) {
    const off = /d[ée]sactive|coupe|sans|off|aucun/.test(m);
    return {
      type: 'control_player',
      command: 'subtitles',
      lang: off ? 'off' : /anglais|english/.test(m) ? 'en' : 'fr',
    };
  }
  if (/\b(vo|version originale)\b/.test(m))
    return { type: 'control_player', command: 'audio', lang: 'en' };
  if (/\b(augmente|monte|plus fort)\b.*\b(son|volume)\b/.test(m))
    return { type: 'control_player', command: 'volumeUp' };
  if (/\b(baisse|diminue|moins fort)\b.*\b(son|volume)\b/.test(m))
    return { type: 'control_player', command: 'volumeDown' };
  if (/\b(coupe|muet|silence)\b|\bmute\b/.test(m))
    return { type: 'control_player', command: 'mute' };
  if (/plein[- ]?[ée]cran|fullscreen/.test(m))
    return { type: 'control_player', command: 'fullscreen' };
  return null;
}
