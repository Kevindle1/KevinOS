import { useCallback, useRef, useState } from 'react';

export type Role = 'user' | 'kai';

export interface Message {
  id: string;
  role: Role;
  text: string;
}

/**
 * KAI simulé — **compagnon** (Règle 9), pas chatbot. Ses réponses s'appuient sur
 * l'environnement simulé : il donne l'impression de **connaître** la journée de
 * Kevin. KAI n'est pas encore développé (Vague 4) ; le vrai KAI se branchera au
 * même endroit (`send`), sans toucher à Home.
 */
interface Rule {
  match: RegExp;
  reply: string;
}

const RULES: Rule[] = [
  {
    match: /photo/i,
    reply:
      '148 photos ont été ajoutées aujourd’hui, surtout en fin d’après-midi. Dès que KOS Vision sera relié, je pourrai t’en faire un album automatiquement. 📷',
  },
  {
    match: /film|série|média|last of us|regarder/i,
    reply:
      'Tu étais à 23 minutes de la fin de l’épisode 5 de The Last of Us. Je pourrai le relancer directement ici quand KOS Media sera branché. 🎬',
  },
  {
    match: /serveur|système|santé|services?/i,
    reply:
      'Le serveur tourne depuis 17 jours, tous les services répondent, la charge est basse. Rien à signaler de ce côté. 🖥️',
  },
  {
    match: /sauvegarde|backup/i,
    reply:
      'La sauvegarde de cette nuit (03:30) s’est terminée sans erreur. La prochaine est prévue demain à la même heure. 💾',
  },
  {
    match: /maison|domotique|appareil|caméra/i,
    reply:
      '12 appareils connectés, tout est normal à la maison. Je te préviendrai immédiatement s’il se passe quoi que ce soit. 🏠',
  },
  {
    match: /stockage|disque|espace/i,
    reply:
      'Il te reste 1,2 To sur 3 — 40 % utilisés seulement. Tu es large, aucune inquiétude à avoir. 💽',
  },
  {
    match: /météo|temps|dehors/i,
    reply: '18° et ensoleillé aujourd’hui — une belle journée pour sortir l’appareil photo. 🌤️',
  },
];

const FALLBACKS: readonly string[] = [
  'Je note. Je ne suis pas encore relié à tous tes modules, mais je veille déjà : dès qu’une compétence KOS sera branchée, je pourrai agir pour toi ici même.',
  'Bonne question. Pour l’instant je m’éveille encore — mais l’accueil que tu vois est bien réel, et c’est autour de moi qu’il est pensé.',
  'Je m’en occuperai avec plaisir dès que le module concerné sera actif. En attendant, tout ce que je t’affiche est déjà là pour te donner une vue d’ensemble.',
];

function replyTo(text: string, turn: number): string {
  const rule = RULES.find((r) => r.match.test(text));
  if (rule) return rule.reply;
  return FALLBACKS[turn % FALLBACKS.length] as string;
}

let seq = 0;
function uid(): string {
  seq += 1;
  return `m${seq}`;
}

export interface KaiState {
  messages: Message[];
  thinking: boolean;
  send: (text: string) => void;
  reset: () => void;
}

export function useSimulatedKai(): KaiState {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const turn = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const send = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setThinking(true);
    const reply = replyTo(text, turn.current);
    turn.current += 1;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: uid(), role: 'kai', text: reply }]);
      setThinking(false);
    }, 800);
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setMessages([]);
    setThinking(false);
    turn.current = 0;
  }, []);

  return { messages, thinking, send, reset };
}
