import { useCallback, useRef, useState } from 'react';

export type Role = 'user' | 'kai';

export interface Message {
  id: string;
  role: Role;
  text: string;
}

/**
 * KAI simulé — **itération 1 de Home**. KAI n'est pas encore développé
 * (Vague 4) ; on simule une réponse calme et honnête pour construire dès
 * maintenant **l'expérience** d'accueil. Le vrai KAI se branchera plus tard
 * exactement au même endroit (`onSubmit` du PromptInput), sans toucher à Home.
 */
const CANNED: readonly string[] = [
  "Je suis KAI, l'intelligence de KevinOS. Je m'éveille encore — bientôt je saurai retrouver tes photos, lancer un film ou veiller sur la maison. Pour l'instant, installe-toi : l'expérience prend vie.",
  "Bonne question. Je ne suis pas encore relié à tes modules, mais l'accueil que tu vois est bien réel — c'est la première pierre de KevinOS.",
  'Je note. Quand mes compétences KOS seront branchées, je pourrai agir pour toi ici même, sans que tu ouvres jamais un autre outil.',
  "Je t'écoute. Cet écran est pensé autour de moi : une seule conversation, une seule expérience.",
];

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
    const reply = CANNED[turn.current % CANNED.length] as string;
    turn.current += 1;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: uid(), role: 'kai', text: reply }]);
      setThinking(false);
    }, 900);
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setMessages([]);
    setThinking(false);
  }, []);

  return { messages, thinking, send, reset };
}
