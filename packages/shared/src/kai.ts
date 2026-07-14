import { z } from 'zod';

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
 * Action **structurée** décidée par KAI (jamais un appel direct à un moteur).
 * KAI propose d'**ouvrir une compétence**, éventuellement paramétrée ; Home la
 * présente sans quitter l'expérience.
 */
export interface KaiAction {
  type: 'open_skill';
  skill: KaiSkillId;
  /** Libellé présenté à l'utilisateur. */
  label: string;
  /** Paramètres de la compétence photos (si `skill = 'photos'`). */
  photoQuery?: KaiPhotoQuery;
  /** Paramètres de la compétence média (si `skill = 'media'`). */
  mediaQuery?: KaiMediaQuery;
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
