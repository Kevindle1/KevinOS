# Journal des changements

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et le
projet le [versionnement sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté — Gouvernance du projet

- **`PRODUCT_VISION.md`** : la boussole (pourquoi KevinOS existe, pour qui, ce
  qu'il ne doit jamais devenir).
- **`docs/REGLES-ARCHITECTURE.md`** : 7 règles permanentes (produit, offline-first,
  API-first, UX-first, KAI, interface unique, documentation), opposables à toute
  décision future.

### Ajouté — Phase 1 : socle sécurité & sauvegardes

- **Authelia (SSO + MFA)** ([ADR-0009](docs/adr/ADR-0009-authelia-sso-mfa.md)) :
  portail d'auth offline-first (base utilisateurs fichier, notifier fichier,
  sessions Redis), intégré à Traefik en **ForwardAuth** ; protège le Core et
  Grafana. Config + gabarit `users_database`.
- **Gestion des secrets** ([ADR-0010](docs/adr/ADR-0010-gestion-secrets.md)) :
  secrets **par fichier** (convention `*_FILE`, mécanisme `secrets:` de Compose,
  moindre privilège) ; l'`.env` ne contient plus aucun secret. Structure
  `deploy/secrets/` (gabarits versionnés, secrets réels ignorés par Git).
- **Sauvegardes Restic** ([ADR-0011](docs/adr/ADR-0011-sauvegardes-restic.md)) :
  image dédiée transparente (Restic + `pg_dump`), chiffrées, dédupliquées,
  rétention 3-2-1, ordonnancement autonome, **script de test de restauration**.
  Overlay `docker-compose.backup.yml`.
- **Monitoring finalisé** : node-exporter (hôte), cAdvisor (conteneurs), promtail
  (logs → Loki), **règles d'alerte** Prometheus (RAM > 90 %, disque < 10 %,
  service down, CPU soutenu). Grafana derrière le SSO.
- Runbook de déploiement complet (secrets, SSO, sauvegardes, restauration,
  monitoring) ; CI valide toutes les combinaisons Compose.

### Ajouté — Système de versioning & compatibilité des modules (ADR-0008)

- **`@kevinos/shared` → `versioning.ts`** : `KEVINOS_VERSIONS`
  (`core` / `api` / `pluginInterface`), `checkCompatibility` (SemVer via `semver`),
  `defaultPluginApiRange`. Règle « peerDependency » : un module est compatible si
  le `pluginInterface` de l'hôte satisfait sa plage `compat.pluginApi`.
- **Contrat de module enrichi** : champs `version` (SemVer du module) et
  `compat.pluginApi` (plage supportée), validés par SemVer.
- **`ModuleRegistry` (Core)** : garde de compatibilité à l'enregistrement — un
  module incompatible est **refusé** (raison journalisée), jamais monté
  silencieusement. Routes `GET /versions` et `GET /modules`.
- Doc [08-versioning](docs/08-versioning.md) + [ADR-0008](docs/adr/ADR-0008-versioning-compatibilite.md).
- Tests : 29 au total (20 shared, 9 core), tous verts.

### Modifié — Repriorisation validée (2026-07-12)

- **Phase 1** = finaliser le socle (Authelia SSO/MFA, Restic sauvegardes, gestion
  des secrets, monitoring, validation sécurité) **avant toute donnée métier**.
- **Phase 2** = module **Fichiers** en tant que **connecteur** de stockage (et non
  clone de Nextcloud). Roadmap et vision KAI (tout est plugin) mises à jour.

### Ajouté — Étape 6 (validation) & Phase 0 (fondations du socle)

**Décisions validées par le propriétaire (2026-07-12)**

- **KAI 100 % local** (Ollama + modèle léger), hors-ligne, gratuit, **sans GPU** ;
  moteur conçu comme **fournisseur interchangeable** ([ADR-0006](docs/adr/ADR-0006-kai-ia-locale.md)).
- **KAI = point d'entrée unique** — « tout passe par KAI » ([Vision KAI](docs/07-vision-kai.md)).
- **Reverse proxy Traefik** (découverte auto + TLS auto) ([ADR-0007](docs/adr/ADR-0007-reverse-proxy-traefik.md)).
- Ordre de développement acté : infra → fichiers → photos → média → dashboard →
  KAI → domotique → reste. Doc mise à jour en conséquence.

**Fondations du monorepo**

- pnpm workspaces, TypeScript strict (`tsconfig.base.json`), ESLint 9 (flat),
  Prettier, EditorConfig, `.nvmrc`, `.gitignore` (exclusion stricte des secrets).

**Paquet `@kevinos/shared`**

- Schéma de configuration (Zod) chargé depuis l'environnement, fail-fast.
- Logger structuré (Pino) avec redaction des secrets.
- Contrat de module (`moduleManifestSchema`) — base de la remplaçabilité (ADR-0005).
- Port `AIProvider` — l'abstraction interchangeable de KAI (ADR-0006).
- 9 tests unitaires.

**Application `@kevinos/core`**

- Service Express + TypeScript en Clean Architecture
  (`domain`/`application`/`infrastructure`/`interfaces`).
- Sondes `/health` (liveness) et `/ready` (readiness, avec mode dégradé).
- Journalisation de requêtes, gestion d'erreurs centralisée, arrêt gracieux.
- Dockerfile multi-étapes, non-root, avec healthcheck. 4 tests (supertest).

**Infrastructure de déploiement (`deploy/`)**

- `docker-compose.yml` du socle : Traefik, Core, PostgreSQL (pgvector), Redis —
  réseaux segmentés `edge`/`apps`/`data`, limites mémoire, healthchecks, aucun
  port entrant hormis le proxy.
- Overlay `docker-compose.observability.yml` : Prometheus, Grafana, Loki,
  Uptime Kuma (optionnel).
- `.env.example`, runbook de déploiement, dossier `modules/` (manifestes).

**Qualité / CI**

- Workflow GitHub Actions : format, lint, build, typecheck, tests + validation
  des fichiers Compose.
- Chaîne `pnpm run check` verte (13 tests) ; Core vérifié en exécution réelle.

## [0.1.0] — 2026-07-12 — Phase Architecture

### Ajouté

- Socle documentaire d'architecture (étapes 1 à 5 de la méthode projet) :
  - **Analyse** du besoin, contexte, contraintes (RAM 16 Go, réseau CGNAT) et risques.
  - **Cahier des charges** fonctionnel & non fonctionnel (exigences `EF-*` / `ENF-*`, MoSCoW).
  - **Architecture** : 4 options comparées, décision = « cœur natif + intégration best-of-breed ».
  - **Choix techniques** justifiés (stack imposée + compléments).
  - **Catalogue des 33 modules** (natifs vs intégrés) + priorisation.
  - **Modèle de sécurité** (défense en profondeur, STRIDE).
  - **Roadmap** en phases P0 → v2 avec budget mémoire.
  - **Diagrammes Mermaid** : contexte, conteneurs, réseau, données, IA.
  - **5 ADR** documentant les décisions structurantes.

[Non publié]: https://github.com/kevindle1/kevinos/compare/main...claude/kevinos-architecture-v80n4x
[0.1.0]: https://github.com/kevindle1/kevinos/tree/main
