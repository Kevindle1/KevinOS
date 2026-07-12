import { pino, type Logger, type LoggerOptions } from 'pino';

export type { Logger };

export interface CreateLoggerOptions {
  /** Nom du service, ajouté à chaque ligne de log. */
  serviceName: string;
  /** Niveau de log. */
  level?: LoggerOptions['level'];
}

/**
 * Crée un logger structuré (JSON) destiné à être agrégé par Loki.
 *
 * Les logs sont émis sur stdout (12-factor / ADR-0002). En développement, on
 * peut brancher `pino-pretty` côté commande ; le code applicatif reste en JSON.
 */
export function createLogger({ serviceName, level = 'info' }: CreateLoggerOptions): Logger {
  return pino({
    level,
    base: { service: serviceName },
    // Horodatage ISO lisible et interopérable.
    timestamp: pino.stdTimeFunctions.isoTime,
    // Ne jamais laisser fuiter de secrets dans les logs (défense en profondeur).
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
      censor: '[redacted]',
    },
  });
}
