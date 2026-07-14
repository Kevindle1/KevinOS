import type { KaiReply } from '@kevinos/shared';

/**
 * Capacités **déterministes** de KAI — la première intelligence, **100 % locale
 * et hors ligne** (Règle 2), sans aucun modèle. Elles répondent aux intentions
 * simples et utiles (bonjour, heure, date, système, ouvrir un module). Ce que
 * KAI ne sait pas traiter ici est délégué au fournisseur IA (Ollama).
 */
export interface KaiModuleInfo {
  id: string;
  name: string;
  /** Mots-clés qui déclenchent l'ouverture (« photos », « films »…). */
  keywords: string[];
}

export interface KaiContext {
  now: Date;
  system: {
    version: string;
    /** Epoch (ms) du démarrage du Core — pour l'uptime. */
    startedAt: number;
  };
  modules: KaiModuleInfo[];
}

/** Une capacité : renvoie une réponse si l'intention correspond, sinon `null`. */
export interface Capability {
  id: string;
  handle(message: string, ctx: KaiContext): KaiReply | null;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

function formatUptime(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 1) return "moins d'une minute";
  if (min < 60) return `${min} minute${min > 1 ? 's' : ''}`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `${days} jour${days > 1 ? 's' : ''}`;
}

const greeting: Capability = {
  id: 'greeting',
  handle(message) {
    if (!/\b(bonjour|bonsoir|salut|coucou|hello|hey|yo)\b/i.test(message)) return null;
    const hour = new Date().getHours();
    const hello = hour < 5 || hour >= 22 ? 'Bonsoir' : hour < 18 ? 'Bonjour' : 'Bonsoir';
    return {
      text: `${hello} Kevin 👋 Je suis KAI. Je débute, mais je peux déjà te donner l'heure, la date, l'état du système, ou ouvrir un module. Que veux-tu faire ?`,
      source: 'capability',
    };
  },
};

const time: Capability = {
  id: 'time',
  handle(message, ctx) {
    if (!/\b(heure|l'heure|quelle heure)\b/i.test(message)) return null;
    return { text: `Il est ${timeFmt.format(ctx.now)}.`, source: 'capability' };
  },
};

const date: Capability = {
  id: 'date',
  handle(message, ctx) {
    if (!/\b(date|quel jour|on est|aujourd'?hui|jour sommes)\b/i.test(message)) return null;
    return { text: `Nous sommes le ${dateFmt.format(ctx.now)}.`, source: 'capability' };
  },
};

const system: Capability = {
  id: 'system',
  handle(message, ctx) {
    if (
      !/\b(système|systeme|serveur|version|santé|sante|état|etat|uptime|en forme)\b/i.test(message)
    )
      return null;
    const uptime = formatUptime(ctx.now.getTime() - ctx.system.startedAt);
    const mods = ctx.modules.length
      ? ctx.modules.map((m) => m.name).join(', ')
      : 'aucun module actif pour le moment';
    return {
      text: `KevinOS Core ${ctx.system.version} fonctionne depuis ${uptime}. Modules actifs : ${mods}.`,
      source: 'capability',
    };
  },
};

/**
 * Compétences pas encore disponibles : KAI est **honnête** (Règle 9) — il ne
 * prétend jamais agir sur un module absent. (Les photos, elles, sont réelles :
 * gérées par la compétence `photos` — voir `skills.ts`.)
 */
const comingSoon: Capability = {
  id: 'coming-soon',
  handle(message) {
    if (/\b(film|films|série|series|média|media|regarder)\b/i.test(message))
      return {
        text: '🎬 KOS Media n’est pas encore disponible — j’y travaille.',
        source: 'capability',
      };
    if (/\b(fichier|fichiers|document|documents|drive)\b/i.test(message))
      return { text: '📁 KOS Drive arrive bientôt.', source: 'capability' };
    if (/\b(maison|domotique|lumière|lumiere|caméra|camera|volet)\b/i.test(message))
      return { text: '🏠 KOS Home arrive bientôt.', source: 'capability' };
    return null;
  },
};

/** Ordre d'évaluation : le plus spécifique gagne. */
export const CAPABILITIES: Capability[] = [time, date, system, greeting, comingSoon];

/** Première capacité qui répond, sinon `null` (→ délégué au modèle IA). */
export function runCapabilities(message: string, ctx: KaiContext): KaiReply | null {
  for (const cap of CAPABILITIES) {
    const reply = cap.handle(message, ctx);
    if (reply) return reply;
  }
  return null;
}
