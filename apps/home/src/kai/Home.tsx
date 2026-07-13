import { useState } from 'react';
import { useSimulatedKai } from './simulate.js';
import { curateHome } from './environment.js';
import { LivingHome } from './LivingHome.js';
import { Conversation } from './Conversation.js';

/**
 * Home — la première expérience de KevinOS. Au repos, un **accueil vivant et
 * minimal** : KAI ne montre que ce qui compte **maintenant** (curation). Dès le
 * premier message, un **fil de conversation**. Un même point d'entrée (`send`)
 * où le vrai KAI se branchera.
 */
export function Home() {
  // Curation figée pour la session (l'accueil ne « saute » pas d'un rendu à l'autre).
  const [state] = useState(curateHome);
  const { messages, thinking, send, reset } = useSimulatedKai();

  if (messages.length === 0) {
    return <LivingHome state={state} onSend={send} busy={thinking} />;
  }
  return <Conversation messages={messages} thinking={thinking} onSend={send} onHome={reset} />;
}
