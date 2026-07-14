import { parsePhotoIntent, type KaiReply } from '@kevinos/shared';
import type { KaiContext } from './capabilities.js';

/**
 * Les **compétences** (Skills) de KAI. L'utilisateur ne demande pas « ouvre un
 * module » : il exprime une tâche, et KAI **invoque une compétence**. Chaque
 * compétence s'appuie sur un module KOS (moteur caché, remplaçable) et renvoie
 * une **action structurée** que Home présente sans quitter l'expérience.
 *
 * KAI ne parle qu'au **contrat** (`PhotoLibrary` pour 📷 photos) — jamais à
 * Immich (Règle 5).
 */
export interface Skill {
  id: string;
  handle(message: string, ctx: KaiContext): KaiReply | null;
}

/** 📷 Photos → KOS Vision. */
const photosSkill: Skill = {
  id: 'photos',
  handle(message) {
    const query = parsePhotoIntent(message);
    if (!query) return null;
    const text =
      query.kind === 'timeline'
        ? 'Voici tes dernières photos.'
        : `Je te montre tes photos : « ${query.text} ».`;
    return {
      text,
      source: 'capability',
      actions: [{ type: 'open_skill', skill: 'photos', label: 'KOS Vision', photoQuery: query }],
    };
  },
};

export const SKILLS: Skill[] = [photosSkill];

/** Première compétence qui répond, sinon `null` (→ capacités puis modèle). */
export function runSkills(message: string, ctx: KaiContext): KaiReply | null {
  for (const skill of SKILLS) {
    const reply = skill.handle(message, ctx);
    if (reply) return reply;
  }
  return null;
}
