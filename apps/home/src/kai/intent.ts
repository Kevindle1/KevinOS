import type { KaiPhotoQuery, KaiMediaQuery, KaiControlPlayerAction } from '@kevinos/shared';

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
