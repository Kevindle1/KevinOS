import type { ReadinessCheck } from '../domain/readiness.js';

export interface LivenessResult {
  status: 'ok';
  service: string;
  version: string;
  uptimeSeconds: number;
}

export interface ReadinessResult {
  /** `ready` si toutes les dépendances sont saines, sinon `degraded`. */
  status: 'ready' | 'degraded';
  checks: Record<string, 'up' | 'down'>;
}

export interface HealthServiceOptions {
  serviceName: string;
  version: string;
  /** Dépendances à sonder pour la disponibilité (readiness). */
  checks?: ReadinessCheck[];
}

/**
 * Cas d'usage « santé du service ».
 *
 * - `liveness()` : le processus tourne-t-il ? (sonde k8s/compose de vie)
 * - `readiness()` : le service peut-il traiter des requêtes ? (dépendances OK)
 *
 * La distinction est délibérée : un Core « vivant » mais dont une dépendance est
 * `down` répond `degraded` — cohérent avec le mode dégradé (ENF-13).
 */
export class HealthService {
  private readonly startedAt: number = Date.now();
  private readonly serviceName: string;
  private readonly version: string;
  private readonly checks: ReadinessCheck[];

  constructor(options: HealthServiceOptions) {
    this.serviceName = options.serviceName;
    this.version = options.version;
    this.checks = options.checks ?? [];
  }

  liveness(): LivenessResult {
    return {
      status: 'ok',
      service: this.serviceName,
      version: this.version,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  async readiness(signal?: AbortSignal): Promise<ReadinessResult> {
    const results = await Promise.all(
      this.checks.map(async (c) => {
        try {
          return [c.name, (await c.check(signal)) ? 'up' : 'down'] as const;
        } catch {
          return [c.name, 'down'] as const;
        }
      }),
    );

    const checks = Object.fromEntries(results);
    const allUp = results.every(([, state]) => state === 'up');
    return { status: allUp ? 'ready' : 'degraded', checks };
  }
}
