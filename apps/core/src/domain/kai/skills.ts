import {
  parsePhotoIntent,
  parseMediaIntent,
  parseDriveIntent,
  parseHomeIntent,
  parsePlayerCommand,
  type KaiReply,
  type KaiControlPlayerAction,
  type KaiDriveQuery,
  type KaiControlHomeAction,
  type KaiHomeQuery,
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

/** Formule la réponse de KAI pour une intention documentaire. */
function ackDrive(query: KaiDriveQuery): string {
  switch (query.kind) {
    case 'find':
      return `Je retrouve ton document : « ${query.text} ».`;
    case 'search':
      return query.text
        ? `Je cherche les documents : « ${query.text} ».`
        : query.docKind
          ? `Voici tes documents ${query.docKind.toUpperCase()}.`
          : 'Voici tes documents.';
    case 'recent':
      return 'Voici tes documents récents.';
    case 'largest':
      return 'Voici tes fichiers les plus volumineux.';
    case 'favorites':
      return 'Voici tes documents favoris.';
    default:
      return 'Voici tes documents.';
  }
}

/** 📁 Drive → KOS Drive. Même patron que `mediaSkill` (preuve de modularité). */
const driveSkill: Skill = {
  id: 'drive',
  handle(message) {
    const query = parseDriveIntent(message);
    if (!query) return null;
    return {
      text: ackDrive(query),
      source: 'capability',
      actions: [{ type: 'open_skill', skill: 'drive', label: 'KOS Drive', driveQuery: query }],
    };
  },
};

const SCENE_NAMES: Record<string, string> = {
  cinema: 'Cinéma',
  lecture: 'Lecture',
  bonne_nuit: 'Bonne nuit',
  bonjour: 'Bonjour',
  je_rentre: 'Je rentre',
  je_pars: 'Je pars',
  travail: 'Travail',
  diner: 'Dîner',
};

/** Réponse de KAI pour un **pilotage** de la maison. */
function ackHomeControl(a: KaiControlHomeAction): string {
  const where = a.room ? ` du ${a.room.toLowerCase()}` : '';
  const all = a.room ? '' : ' toutes';
  switch (a.command) {
    case 'activate_scene':
      return `J'active l'ambiance ${SCENE_NAMES[a.scene ?? ''] ?? a.scene}.`;
    case 'turn_on':
      return `J'allume${all} les lumières${where}.`;
    case 'turn_off':
      return `J'éteins${all} les lumières${where}.`;
    case 'set_brightness':
      return `Je règle les lumières${where} à ${a.value ?? 50} %.`;
    case 'open':
      return a.deviceKind === 'door'
        ? `J'ouvre${where || ' le portail'}.`
        : `J'ouvre les volets${where}.`;
    case 'close':
      return a.deviceKind === 'door'
        ? `Je ferme${where || ' le portail'}.`
        : `Je ferme les volets${where}.`;
    case 'set_temperature':
      return a.value != null
        ? `Je règle le chauffage${where} à ${a.value} °C.`
        : `Je monte le chauffage${where}.`;
    default:
      return "C'est fait.";
  }
}

/** Réponse de KAI pour une **question** sur la maison. */
function ackHomeView(q: KaiHomeQuery): string {
  const where = q.room ? ` du ${q.room.toLowerCase()}` : '';
  switch (q.kind) {
    case 'climate':
      return `Voici la température${where}.`;
    case 'presence':
      return 'Voici qui est à la maison.';
    case 'cameras':
      return q.room ? `Voici la caméra${where}.` : 'Voici tes caméras.';
    case 'energy':
      return 'Voici ta consommation.';
    case 'lights':
      return 'Voici tes lumières.';
    case 'room':
      return `Voici ${q.room}.`;
    default:
      return 'Voici ta maison.';
  }
}

/** 🏠 Home → KOS Home. Pilote la maison (control_home) ou l'affiche (open_skill). */
const homeSkill: Skill = {
  id: 'home',
  handle(message) {
    const r = parseHomeIntent(message);
    if (!r) return null;
    if ('control' in r) {
      return { text: ackHomeControl(r.control), source: 'capability', actions: [r.control] };
    }
    return {
      text: ackHomeView(r.view),
      source: 'capability',
      actions: [{ type: 'open_skill', skill: 'home', label: 'KOS Home', homeQuery: r.view }],
    };
  },
};

export const SKILLS: Skill[] = [playerSkill, photosSkill, mediaSkill, driveSkill, homeSkill];

/** Première compétence qui répond, sinon `null` (→ capacités puis modèle). */
export function runSkills(message: string, ctx: KaiContext): KaiReply | null {
  for (const skill of SKILLS) {
    const reply = skill.handle(message, ctx);
    if (reply) return reply;
  }
  return null;
}
