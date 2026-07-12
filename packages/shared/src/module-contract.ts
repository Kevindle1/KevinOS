import { z } from 'zod';
import { isSemver, isSemverRange, defaultPluginApiRange } from './versioning.js';

/**
 * Contrat de module KevinOS (ADR-0005).
 *
 * Tout module — natif ou intégré (Immich, Jellyfin…) — se décrit par un
 * manifeste. Le Core le lit pour peupler son registre de services. Le reste du
 * système (Dashboard, KAI) ne connaît QUE ces capacités abstraites, jamais
 * l'application concrète : c'est ce qui rend les modules remplaçables.
 */

/** Familles de capacités qu'un module peut exposer au Core. */
export const moduleCapabilitySchema = z.enum([
  'files', // stockage / fichiers
  'photos', // bibliothèque photo
  'media', // films / séries
  'music',
  'home', // domotique
  'backup',
  'monitoring',
  'automation',
  'ai', // fournisseur d'intelligence
]);
export type ModuleCapability = z.infer<typeof moduleCapabilitySchema>;

/** Niveau d'accès requis pour interagir avec un module. */
export const accessLevelSchema = z.enum(['public', 'member', 'admin']);
export type AccessLevel = z.infer<typeof accessLevelSchema>;

/** Chaîne SemVer (ex. `1.0.0`). */
export const semverSchema = z
  .string()
  .refine(isSemver, 'version SemVer invalide (attendu ex. « 1.0.0 »)');

/** Plage SemVer (ex. `^1.0.0`, `>=1.0.0 <2.0.0`). */
export const semverRangeSchema = z
  .string()
  .refine(isSemverRange, 'plage SemVer invalide (attendu ex. « ^1.0.0 »)');

/** Exigences de compatibilité d'un module vis-à-vis de l'hôte (ADR-0008). */
export const moduleCompatSchema = z.object({
  /** Plage de `pluginInterface` de l'hôte supportée (défaut : même MAJEUR courant). */
  pluginApi: semverRangeSchema.default(() => defaultPluginApiRange()),
});
export type ModuleCompatManifest = z.infer<typeof moduleCompatSchema>;

/** Manifeste déclaratif d'un module (fichier `deploy/modules/<nom>/module.yaml`). */
export const moduleManifestSchema = z.object({
  /** Identifiant stable, ex. `kevin-photos`. */
  id: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*$/, 'id en kebab-case, minuscules'),

  /** Nom lisible, ex. « Kevin Photos ». */
  name: z.string().min(1),

  /** Version SemVer propre du module, ex. « Module Files v1 » → `1.0.0` (ADR-0008). */
  version: semverSchema,

  /** Exigences de compatibilité avec l'hôte (Plugin Interface). */
  compat: moduleCompatSchema.default({}),

  /** Application concrète qui implémente actuellement le module, ex. `immich`. */
  implementation: z.string().min(1),

  /** Capacités exposées au Core. */
  capabilities: z.array(moduleCapabilitySchema).min(1),

  /** URL interne (réseau `apps`) où le Core joint le module. */
  internalUrl: z.string().url(),

  /** Endpoint de santé relatif, ex. `/api/health`. */
  healthPath: z.string().startsWith('/').default('/'),

  /** Niveau d'accès minimal requis. */
  requiredAccess: accessLevelSchema.default('member'),

  /** Le module est-il activé dans ce déploiement ? (déploiement progressif) */
  enabled: z.boolean().default(false),
});
export type ModuleManifest = z.infer<typeof moduleManifestSchema>;

/** État de santé observé d'un module. */
export type ModuleHealth = 'up' | 'down' | 'unknown';

/**
 * Vue runtime d'un module dans le registre du Core : le manifeste + son état
 * observé. Permet le mode dégradé (ENF-13) : un module `down` n'empêche pas les
 * autres de fonctionner.
 */
export interface RegisteredModule {
  manifest: ModuleManifest;
  health: ModuleHealth;
  lastCheckedAt: string | null;
}
