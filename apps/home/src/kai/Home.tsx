import { useState } from 'react';
import { useSimulatedKai } from './simulate.js';
import { getSnapshot } from './environment.js';
import { LivingHome } from './LivingHome.js';
import { Conversation } from './Conversation.js';

/**
 * Home — la première expérience de KevinOS. Au repos, un **accueil vivant** (KAI
 * présent, la journée racontée) ; dès le premier message, un **fil de
 * conversation**. Un même point d'entrée (`send`) où le vrai KAI se branchera.
 */
export function Home() {
  // Instantané figé pour la session (le salut ne « saute » pas d'un rendu à l'autre).
  const [snapshot] = useState(getSnapshot);
  const { messages, thinking, send, reset } = useSimulatedKai();

  if (messages.length === 0) {
    return <LivingHome snapshot={snapshot} onSend={send} busy={thinking} />;
  }
  return <Conversation messages={messages} thinking={thinking} onSend={send} onHome={reset} />;
}
