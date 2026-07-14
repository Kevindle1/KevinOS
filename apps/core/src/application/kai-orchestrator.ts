import type { AIProvider, ChatMessage, KaiReply, Logger } from '@kevinos/shared';
import { runCapabilities, type KaiContext } from '../domain/kai/capabilities.js';

/**
 * KAI — le **cerveau** et l'**unique point d'entrée** de KevinOS (Règle 5).
 *
 * Stratégie de réponse :
 *  1. **Capacités déterministes** (locales, hors ligne) — bonjour, heure, date,
 *     système, ouvrir un module. Rapides, fiables, sans modèle.
 *  2. Sinon, délégation au **fournisseur IA** (Ollama, via le port `AIProvider`).
 *  3. Si le modèle est indisponible ou échoue → **repli** honnête (mode dégradé,
 *     ENF-13). KAI ne plante jamais.
 *
 * KAI ne connaît ni Ollama ni les modules : il ne voit que des **contrats**.
 */
const DEFAULT_SYSTEM_PROMPT = [
  'Tu es KAI, l’intelligence de KevinOS, un système personnel, privé et local.',
  'Tu réponds en français, de façon brève, calme et utile. Tu tutoies Kevin.',
  'Tu débutes : sois honnête sur tes limites, ne prétends jamais avoir agi sur',
  'un module que tu ne contrôles pas encore. Pas de bavardage inutile.',
].join(' ');

const FALLBACK_TEXT =
  'Je débute encore et je n’ai pas pu traiter cette demande. Je sais déjà te ' +
  'donner l’heure, la date, l’état du système ou ouvrir un module — essaie l’un ' +
  'de ceux-là.';

export interface KaiOrchestratorDeps {
  provider: AIProvider;
  /** Contexte frais à chaque tour (heure courante, modules, système). */
  context: () => KaiContext;
  logger: Logger;
  systemPrompt?: string;
  /** Coupe la génération du modèle si elle traîne (ms). */
  timeoutMs?: number;
}

export class KaiOrchestrator {
  constructor(private readonly deps: KaiOrchestratorDeps) {}

  async handle(message: string): Promise<KaiReply> {
    const ctx = this.deps.context();

    // 1. Capacités locales déterministes.
    const capability = runCapabilities(message, ctx);
    if (capability) return capability;

    // 2. Fournisseur IA — seulement s'il est joignable et sait discuter.
    const available = await this.deps.provider.isAvailable().catch(() => false);
    if (!available || !this.deps.provider.capabilities.chat) {
      return { text: FALLBACK_TEXT, source: 'fallback' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.deps.timeoutMs ?? 30_000);
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: this.deps.systemPrompt ?? DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: message },
      ];
      let text = '';
      for await (const chunk of this.deps.provider.chat({ messages, signal: controller.signal })) {
        text += chunk.delta;
      }
      const trimmed = text.trim();
      return trimmed
        ? { text: trimmed, source: 'model' }
        : { text: FALLBACK_TEXT, source: 'fallback' };
    } catch (err) {
      this.deps.logger.warn({ err }, 'kai_model_failed');
      return { text: FALLBACK_TEXT, source: 'fallback' };
    } finally {
      clearTimeout(timer);
    }
  }
}
