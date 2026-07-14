import {
  parsePhotoIntent,
  parseMediaIntent,
  parsePlayerCommand,
  type KaiReply,
  type KaiControlPlayerAction,
} from '@kevinos/shared';
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

function ackPlayer(cmd: KaiControlPlayerAction): string {
  switch (cmd.command) {
    case 'play':
      return 'Je reprends la lecture.';
    case 'pause':
      return 'En pause.';
    case 'seekBy':
      return (cmd.amountSec ?? 0) < 0
        ? `Je recule de ${Math.abs(cmd.amountSec ?? 0)} secondes.`
        : `J'avance de ${cmd.amountSec ?? 0} secondes.`;
    case 'nextEpisode':
      return 'Épisode suivant.';
    case 'prevEpisode':
      return 'Épisode précédent.';
    case 'skipIntro':
      return "Je passe l'introduction.";
    case 'subtitles':
      return cmd.lang === 'off'
        ? 'Sous-titres désactivés.'
        : `Sous-titres ${cmd.lang === 'en' ? 'anglais' : 'français'}.`;
    case 'audio':
      return `Piste audio ${cmd.lang === 'en' ? 'anglaise (VO)' : 'française'}.`;
    case 'volumeUp':
      return "J'augmente le volume.";
    case 'volumeDown':
      return 'Je baisse le volume.';
    case 'mute':
      return 'Son coupé.';
    case 'fullscreen':
      return 'Plein écran.';
    case 'close':
      return 'Je ferme le lecteur.';
    default:
      return "C'est fait.";
  }
}

/** 🎮 Télécommande — pilote le lecteur KevinOS en langage naturel. */
const playerSkill: Skill = {
  id: 'player',
  handle(message) {
    const cmd = parsePlayerCommand(message);
    if (!cmd) return null;
    return { text: ackPlayer(cmd), source: 'capability', actions: [cmd] };
  },
};

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

/** 🎬 Media → KOS Media. Même patron que `photosSkill` (preuve de modularité). */
const mediaSkill: Skill = {
  id: 'media',
  handle(message) {
    const query = parseMediaIntent(message);
    if (!query) return null;
    const text =
      query.kind === 'continue'
        ? 'Je reprends ta lecture.'
        : query.kind === 'series'
          ? 'Voici tes séries.'
          : query.kind === 'search'
            ? `Je cherche : « ${query.text} ».`
            : 'Voici tes films.';
    return {
      text,
      source: 'capability',
      actions: [{ type: 'open_skill', skill: 'media', label: 'KOS Media', mediaQuery: query }],
    };
  },
};

export const SKILLS: Skill[] = [playerSkill, photosSkill, mediaSkill];

/** Première compétence qui répond, sinon `null` (→ capacités puis modèle). */
export function runSkills(message: string, ctx: KaiContext): KaiReply | null {
  for (const skill of SKILLS) {
    const reply = skill.handle(message, ctx);
    if (reply) return reply;
  }
  return null;
}
