import { z } from 'zod';

/**
 * Contrats publics de **KAI** — le point d'entrée unique de KevinOS (Règle 5,
 * API-first Règle 3). Home, une future app mobile ou une API publique consomment
 * **exactement** ces types. KAI ne parle qu'à des **contrats** ; il ne connaît
 * jamais l'implémentation d'un module ni le fournisseur IA sous-jacent.
 */

/** D'où vient la réponse : capacité déterministe, modèle IA, ou repli. */
export type KaiReplySource = 'capability' | 'model' | 'fallback';

/**
 * Action **structurée** décidée par KAI (jamais un appel direct à un moteur).
 * En V1, KAI sait proposer d'ouvrir un module KOS ; le Core/Home route ensuite.
 */
export interface KaiAction {
  type: 'open_module';
  /** Identifiant du module KOS, ex. `kos-vision`. */
  moduleId: string;
  /** Libellé présenté à l'utilisateur. */
  label: string;
}

/** Un tour de conversation entrant. */
export interface KaiTurnRequest {
  message: string;
}

/** La réponse de KAI. */
export interface KaiReply {
  text: string;
  source: KaiReplySource;
  /** Actions proposées (ex. ouvrir KOS Vision). */
  actions?: KaiAction[];
}

/** Validation de la requête entrante (fail-fast côté Core). */
export const kaiTurnRequestSchema = z.object({
  message: z.string().min(1).max(4000),
});
