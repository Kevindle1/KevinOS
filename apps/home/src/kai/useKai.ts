import { useCallback, useRef, useState } from 'react';
import { askKai } from './client.js';
import { simulatedReply, type Message } from './simulate.js';

/** Durée minimale de « réflexion » — garde un rythme naturel même en repli. */
const MIN_THINK_MS = 550;

let seq = 0;
function uid(): string {
  seq += 1;
  return `m${seq}`;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export interface KaiState {
  messages: Message[];
  thinking: boolean;
  send: (text: string) => void;
  reset: () => void;
}

/**
 * Le KAI de Home. Il interroge d'abord le **vrai KAI** (le Core) ; s'il n'est pas
 * joignable (Preview sans backend), il **retombe** sur une réponse simulée. Même
 * point d'entrée que le Core (`message` → `KaiReply`) : rien à changer ici quand
 * KAI gagne des capacités.
 */
export function useKai(): KaiState {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const turn = useRef(0);

  const send = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setThinking(true);
    const t = turn.current;
    turn.current += 1;

    void Promise.all([askKai(text), wait(MIN_THINK_MS)]).then(([reply]) => {
      const answer = reply?.text?.trim() ? reply.text.trim() : simulatedReply(text, t);
      setMessages((m) => [...m, { id: uid(), role: 'kai', text: answer }]);
      setThinking(false);
    });
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setThinking(false);
    turn.current = 0;
  }, []);

  return { messages, thinking, send, reset };
}
