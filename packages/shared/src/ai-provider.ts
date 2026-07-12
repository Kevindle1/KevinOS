/**
 * Port `AIProvider` (ADR-0006).
 *
 * KAI, le cerveau de KevinOS, ne parle JAMAIS directement à Ollama ni à aucune
 * API : il ne dépend que de cette interface. Le fournisseur est interchangeable
 * par configuration. En V1, seul l'adaptateur local (Ollama) est packagé ; les
 * adaptateurs externes (OpenAI, Claude, Gemini) sont optionnels et désactivés
 * par défaut — les ajouter plus tard ne modifie pas le cœur.
 */

/** Capacités qu'un fournisseur IA déclare supporter. */
export interface AICapabilities {
  chat: boolean;
  /** Génération d'embeddings (pour le RAG via pgvector). */
  embeddings: boolean;
  /** Appel d'outils / actions (agents pilotant KevinOS). */
  tools: boolean;
  /** Analyse d'images (Phase ultérieure / matériel dédié). */
  vision: boolean;
}

/** Rôle d'un message de conversation. */
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /** Écrase le modèle par défaut du fournisseur si fourni. */
  model?: string;
  /** 0 = déterministe. Par défaut, laissé au fournisseur. */
  temperature?: number;
  /** Coupe la génération (utile pour tests et budgets). */
  signal?: AbortSignal;
}

/** Fragment de réponse en flux (streaming token par token). */
export interface ChatChunk {
  /** Texte incrémental. */
  delta: string;
  /** Vrai sur le dernier fragment. */
  done: boolean;
}

export interface EmbedRequest {
  input: string[];
  model?: string;
  signal?: AbortSignal;
}

/**
 * Interface stable implémentée par chaque adaptateur de fournisseur IA.
 * Exemple V1 : `OllamaProvider implements AIProvider`.
 */
export interface AIProvider {
  /** Identifiant du fournisseur, ex. `local`, `openai`. */
  readonly id: string;

  /** Capacités déclarées. */
  readonly capabilities: AICapabilities;

  /** Le fournisseur est-il joignable ? (utilisé par /ready et le mode dégradé) */
  isAvailable(signal?: AbortSignal): Promise<boolean>;

  /** Conversation en flux. */
  chat(request: ChatRequest): AsyncIterable<ChatChunk>;

  /** Embeddings (optionnel — présent si `capabilities.embeddings`). */
  embed?(request: EmbedRequest): Promise<number[][]>;
}
