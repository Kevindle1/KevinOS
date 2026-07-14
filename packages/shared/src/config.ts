import { z } from 'zod';

/**
 * Schéma de configuration du runtime KevinOS.
 *
 * La configuration est fournie par l'environnement (12-factor / K8s-ready — voir
 * ADR-0002). Aucun secret n'est codé en dur ; tout provient de `process.env`.
 */
export const configSchema = z.object({
  /** Environnement d'exécution. */
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),

  /** Nom logique du service (utile pour logs/observabilité). */
  serviceName: z.string().min(1).default('kevinos-core'),

  /** Interface d'écoute HTTP. `0.0.0.0` en conteneur. */
  host: z.string().min(1).default('0.0.0.0'),

  /** Port HTTP. */
  port: z.coerce.number().int().min(1).max(65_535).default(8080),

  /** Niveau de log Pino (`silent` désactive toute sortie). */
  logLevel: z.enum(['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  /**
   * Fournisseur IA actif. `local` (Ollama) est le seul packagé en V1
   * (ADR-0006). Les autres sont des adaptateurs optionnels, désactivés par
   * défaut.
   */
  aiProvider: z.enum(['local', 'openai', 'anthropic', 'gemini']).default('local'),

  /** URL du runtime Ollama (fournisseur IA local). */
  ollamaBaseUrl: z.string().url().default('http://kai-ollama:11434'),

  /** Modèle IA local par défaut (léger — voir ADR-0006). */
  aiModel: z.string().min(1).default('qwen2.5:3b'),

  /**
   * URL interne de l'API du moteur de photos (KOS Vision → Immich). Détail
   * d'implémentation : jamais exposé à l'utilisateur ni au Dashboard.
   */
  immichBaseUrl: z.string().url().default('http://kos-vision-server:2283/api'),

  /**
   * URL interne du moteur média (KOS Media → Jellyfin). Détail d'implémentation :
   * jamais exposé à l'utilisateur ni au Dashboard.
   */
  jellyfinBaseUrl: z.string().url().default('http://kos-media-server:8096'),
});

/** Configuration validée et typée de KevinOS. */
export type KevinConfig = z.infer<typeof configSchema>;

/**
 * Construit la configuration depuis un jeu de variables d'environnement.
 *
 * @param env - source des variables (par défaut `process.env`).
 * @returns configuration validée.
 * @throws {z.ZodError} si une variable est invalide (fail-fast au démarrage).
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): KevinConfig {
  return configSchema.parse({
    nodeEnv: env.NODE_ENV,
    serviceName: env.KEVINOS_SERVICE_NAME,
    host: env.KEVINOS_HOST,
    port: env.KEVINOS_PORT,
    logLevel: env.KEVINOS_LOG_LEVEL,
    aiProvider: env.KEVINOS_AI_PROVIDER,
    ollamaBaseUrl: env.KEVINOS_OLLAMA_BASE_URL,
    aiModel: env.KEVINOS_AI_MODEL,
    immichBaseUrl: env.KEVINOS_IMMICH_BASE_URL,
    jellyfinBaseUrl: env.KEVINOS_JELLYFIN_BASE_URL,
  });
}
