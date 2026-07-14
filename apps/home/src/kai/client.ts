import type { KaiReply } from '@kevinos/shared';

/**
 * Client du **vrai KAI** (le Core). Home ne connaît que le **contrat**
 * (`KaiReply`) — jamais Ollama ni un module.
 *
 * En développement, Vite proxifie `/api` vers le Core. En Preview (statique, sans
 * backend), l'appel échoue une fois puis on **cesse d'essayer** (repli simulé) :
 * l'expérience ne casse jamais et on n'inonde pas le réseau de requêtes vaines.
 */
const KAI_URL = (import.meta.env.VITE_KAI_URL ?? '/api/v1/kai/message') as string;

/** null = inconnu · true = joignable · false = absent (on arrête d'essayer). */
let backendAvailable: boolean | null = null;

/** Le Core a-t-il déjà répondu au moins une fois cette session ? */
export function kaiIsLive(): boolean {
  return backendAvailable === true;
}

export async function askKai(message: string, signal?: AbortSignal): Promise<KaiReply | null> {
  if (backendAvailable === false) return null;
  try {
    const res = await fetch(KAI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message }),
      ...(signal ? { signal } : {}),
    });
    if (!res.ok) {
      backendAvailable = false;
      return null;
    }
    backendAvailable = true;
    return (await res.json()) as KaiReply;
  } catch {
    backendAvailable = false;
    return null;
  }
}
