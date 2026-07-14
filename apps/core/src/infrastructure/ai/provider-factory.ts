import type { AIProvider, AICapabilities, ChatChunk, KevinConfig } from '@kevinos/shared';
import { OllamaProvider } from './ollama-provider.js';

/**
 * Fournisseur **indisponible** — utilisé quand un provider externe est
 * sélectionné mais **non packagé** en V1 (OpenAI, Claude, Gemini restent
 * optionnels — ADR-0006). KAI bascule alors en mode dégradé (repli), sans
 * jamais planter. Ajouter un vrai adaptateur plus tard ne touche pas le cœur.
 */
class UnavailableProvider implements AIProvider {
  readonly capabilities: AICapabilities = {
    chat: false,
    embeddings: false,
    tools: false,
    vision: false,
  };
  constructor(readonly id: string) {}
  async isAvailable(): Promise<boolean> {
    return false;
  }
  // eslint-disable-next-line require-yield
  async *chat(): AsyncIterable<ChatChunk> {
    throw new Error(`provider_${this.id}_indisponible`);
  }
}

/**
 * Sélectionne le fournisseur IA selon la configuration (**interchangeable** —
 * Règle « tout est plugin »). `local` = Ollama, packagé ; les autres sont des
 * adaptateurs futurs, désactivés par défaut.
 */
export function createAIProvider(config: KevinConfig): AIProvider {
  switch (config.aiProvider) {
    case 'local':
      return new OllamaProvider({ baseUrl: config.ollamaBaseUrl, model: config.aiModel });
    default:
      return new UnavailableProvider(config.aiProvider);
  }
}
