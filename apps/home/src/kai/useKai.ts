import { useCallback, useRef, useState } from 'react';
import type { KaiAction } from '@kevinos/shared';
import { askKai } from './client.js';
import { detectPhotoIntent } from './intent.js';
import { simulatedReply, type Message } from './simulate.js';

/** Durée minimale de « réflexion » — garde un rythme naturel même en repli. */
const MIN_THINK_MS = 550;

let seq = 0;
function uid(): string {
  seq += 1;
  return `m${seq}`;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

interface Reply {
  text: string;
  actions?: KaiAction[];
}

async function respond(text: string, turn: number): Promise<Reply> {
  const real = await askKai(text);
  if (real && real.text.trim()) {
    return real.actions
      ? { text: real.text.trim(), actions: real.actions }
      : { text: real.text.trim() };
  }
  // Repli hors-ligne (Preview sans Core) : on détecte quand même les photos.
  const photo = detectPhotoIntent(text);
  if (photo) {
    return {
      text:
        photo.kind === 'timeline'
          ? 'Voici tes dernières photos.'
          : `Je te montre tes photos : « ${photo.text} ».`,
      actions: [{ type: 'open_skill', skill: 'photos', label: 'KOS Vision', photoQuery: photo }],
    };
  }
  return { text: simulatedReply(text, turn) };
}

export interface KaiState {
  messages: Message[];
  thinking: boolean;
  send: (text: string) => void;
  reset: () => void;
}

/**
 * Le KAI de Home. Il interroge d'abord le **vrai KAI** (le Core) ; sinon il
 * retombe sur un repli. Quand la réponse porte une **action** (ouvrir une
 * compétence), `onAction` la remonte à Home pour la présenter sans quitter
 * l'expérience.
 */
export function useKai(opts?: { onAction?: (action: KaiAction) => void }): KaiState {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const turn = useRef(0);
  const onAction = useRef(opts?.onAction);
  onAction.current = opts?.onAction;

  const send = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setThinking(true);
    const t = turn.current;
    turn.current += 1;

    void Promise.all([respond(text, t), wait(MIN_THINK_MS)]).then(([reply]) => {
      setMessages((m) => [...m, { id: uid(), role: 'kai', text: reply.text }]);
      setThinking(false);
      reply.actions?.forEach((a) => onAction.current?.(a));
    });
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setThinking(false);
    turn.current = 0;
  }, []);

  return { messages, thinking, send, reset };
}
