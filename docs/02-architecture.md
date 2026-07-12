# 02 — Architecture

> Étape 3. Conformément à la méthode : **plusieurs architectures sont proposées,
> comparées (avantages / inconvénients), puis une décision est prise et
> justifiée.**

---

## 1. Les quatre options envisagées

### Option A — Monolithe modulaire

Une seule application Node.js structurée en modules internes (packages), servie
derrière un proxy, avec une base de données unique.

```
┌─────────────────────────────────────┐
│         Application KevinOS          │
│  ┌──────┬──────┬──────┬──────────┐   │
│  │ Auth │ Dash │  AI  │  Files … │   │  (modules = packages internes)
│  └──────┴──────┴──────┴──────────┘   │
└──────────────┬──────────────────────┘
               │
          PostgreSQL
```

| ✅ Avantages                           | ❌ Inconvénients                                                     |
| -------------------------------------- | -------------------------------------------------------------------- |
| Simple à démarrer, un seul déploiement | « Modules indépendants et remplaçables » non respecté                |
| Faible surcoût mémoire                 | Un crash peut tout emporter (pas d'isolation)                        |
| Transactions faciles (une seule DB)    | Impossible d'intégrer Immich/Jellyfin/HA (ce sont des apps séparées) |
|                                        | Ne monte pas vers Kubernetes naturellement                           |

➡️ **Rejetée** : incompatible avec l'exigence ENF-01 (modules remplaçables) et
avec le principe « ne pas réinventer » (on _doit_ orchestrer des apps tierces).

---

### Option B — Microservices « from scratch » sur Docker Compose

On écrit **soi-même** chaque module (photos, médias, cloud…) comme un
micro-service maison, orchestré par Docker Compose.

| ✅ Avantages                       | ❌ Inconvénients                                                         |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Contrôle total, cohérence maximale | **Des années de travail** pour égaler Immich/Jellyfin/HA                 |
| Isolation par conteneur            | Réinvention massive → « recherche de la facilité » inversée : sur-effort |
|                                    | Maintenance colossale pour un seul mainteneur                            |
|                                    | Time-to-value catastrophique                                             |

➡️ **Rejetée** : viole le bon sens d'ingénierie. Réécrire un moteur de photos IA
ou une plateforme domotique n'a aucune valeur ajoutée et détruit la longévité du
projet.

---

### Option C — Kubernetes microservices (cible « milliers d'utilisateurs »)

Cluster Kubernetes, chaque module en Deployment, Ingress, autoscaling, etc.

| ✅ Avantages                                     | ❌ Inconvénients                                               |
| ------------------------------------------------ | -------------------------------------------------------------- |
| Scalabilité, HA, self-healing, standard cloud    | **Sur-dimensionné** pour 1 nœud / 16 Go                        |
| Idéal si le projet devient vraiment multi-tenant | Le control-plane consomme déjà une part de la RAM              |
| Écosystème riche (Helm, opérateurs)              | Complexité d'exploitation élevée pour 1 mainteneur             |
|                                                  | Beaucoup d'apps self-host sont livrées en Compose, pas en Helm |

➡️ **Reportée** : c'est la **cible future**, pas le point de départ. On garde la
compatibilité (voir décision). Détail dans [ADR-0002](adr/ADR-0002-orchestration.md).

---

### Option D — ✅ **Cœur KevinOS + intégration best-of-breed (RETENUE)**

KevinOS **n'écrit que sa valeur unique** — le **liant** — et **orchestre** des
applications open-source matures pour les domaines métier.

**Ce que KevinOS construit lui-même (code natif) :**

- **KevinOS Core** : API Gateway, registre de services, config, bus d'événements.
- **Kevin Dashboard** : l'interface unifiée (React).
- **Kevin AI** : l'orchestrateur d'intelligence (agents, RAG, mémoire).
- **Kevin API / SDK / CLI** : les interfaces développeur.
- L'intégration **Auth (SSO/MFA)** transverse.

**Ce que KevinOS intègre (existant, remplaçable) :**

- Immich (photos), Jellyfin (médias), Nextcloud (cloud), Home Assistant
  (domotique), Vaultwarden (mots de passe), Prometheus/Grafana (monitoring), etc.

```
                    Utilisateur (web / mobile)
                              │  HTTPS
                    ┌─────────▼──────────┐
                    │   Reverse Proxy    │  (Traefik/Caddy) — TLS, routage
                    └─────────┬──────────┘
                    ┌─────────▼──────────┐
                    │   SSO / MFA        │  (Authelia/Authentik)
                    └─────────┬──────────┘
        ┌─────────────────────┼───────────────────────────┐
        │                     │                            │
┌───────▼────────┐  ┌─────────▼─────────┐        ┌─────────▼──────────┐
│  KevinOS Core  │  │  Kevin Dashboard  │        │     Kevin AI       │
│  (API Gateway, │  │  (React UI)       │        │ (orchestrateur,    │
│  registry,     │  │                   │        │  RAG, agents,      │
│  event bus)    │  │                   │        │  mémoire)          │
└───────┬────────┘  └───────────────────┘        └─────────┬──────────┘
        │  intègre / pilote (API)                          │ Ollama / API
        ▼                                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│   Modules intégrés (open-source, remplaçables) :                   │
│   Nextcloud · Immich · Jellyfin · Home Assistant · Vaultwarden ·   │
│   AdGuard · Restic · Frigate · n8n · Gitea · Uptime Kuma …         │
└───────────────────────────────────────────────────────────────────┘

  Données partagées : PostgreSQL · Redis · Object/Files storage
  Observabilité : Prometheus · Grafana · Loki
```

| ✅ Avantages                                                 | ❌ Inconvénients                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Time-to-value** rapide (briques matures)                   | Hétérogénéité des apps intégrées (styles d'API variés)            |
| Respecte « modules **remplaçables** » (interface Core)       | La couche d'intégration est le vrai défi (mais c'est _la_ valeur) |
| Isolation par conteneur, mode dégradé                        | Chaque app tierce a sa propre DB/config à gérer                   |
| Compatible Compose **aujourd'hui**, K8s **demain**           | SSO à câbler sur des apps qui le supportent inégalement           |
| Effort concentré sur ce qui différencie KevinOS (le cerveau) |                                                                   |

➡️ **RETENUE.** C'est l'architecture d'un CTO senior : maximiser la valeur créée,
minimiser la dette réinventée, préserver la longévité et la modularité. Voir
[ADR-0004](adr/ADR-0004-integrer-vs-construire.md).

---

## 2. Décision d'architecture (synthèse)

| Décision             | Choix                                                               | ADR                                                 |
| -------------------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| Style global         | **Cœur natif + intégration best-of-breed** (Option D)               | [ADR-0004](adr/ADR-0004-integrer-vs-construire.md)  |
| Orchestration v1     | **Docker Compose**, K8s-ready plus tard                             | [ADR-0002](adr/ADR-0002-orchestration.md)           |
| Organisation du code | **Monorepo** (pnpm workspaces)                                      | [ADR-0001](adr/ADR-0001-monorepo.md)                |
| Accès distant        | **VPN par défaut** (WireGuard)                                      | [ADR-0003](adr/ADR-0003-acces-distant-vpn.md)       |
| Frontière modules    | Le **Core** expose une interface stable ; les modules sont derrière | [ADR-0005](adr/ADR-0005-couche-integration-core.md) |

---

## 3. Vue en couches (C4 — niveau conteneurs)

Voir le diagramme détaillé : [`diagrammes/conteneurs.md`](diagrammes/conteneurs.md).

1. **Couche Edge** — Reverse proxy (TLS, routage, rate-limit) + WAF/CrowdSec.
2. **Couche Identité** — SSO/MFA, gestion utilisateurs & rôles.
3. **Couche KevinOS (native)** — Core (gateway/registry/event-bus), Dashboard, AI.
4. **Couche Modules** — apps intégrées, chacune conteneurisée et isolée.
5. **Couche Données** — PostgreSQL, Redis, stockage fichiers/objets.
6. **Couche Observabilité** — Prometheus, Grafana, Loki, Uptime Kuma.
7. **Couche Sauvegarde** — Restic/Kopia vers HDD dédié + cible hors-site (option).

## 4. Principes structurants

1. **Le Core est le seul point d'intégration.** Un module intégré n'est jamais
   appelé « en dur » par le Dashboard : il passe par une **interface stable** du
   Core. Ainsi remplacer Immich par autre chose n'impacte pas le reste.
2. **Isolation & mode dégradé.** L'arrêt d'un module ne casse pas les autres
   (ENF-13). Le Dashboard affiche l'indisponibilité proprement.
3. **Segmentation réseau.** Réseaux Docker séparés : `edge`, `apps`, `data`,
   `observability`. La base de données n'est jamais exposée à `edge`.
4. **Budget de ressources.** Chaque service déclare `mem_limit`/`cpus`. Le socle
   tient dans ≤ 4 Go (ENF-11).
5. **Stateless au maximum côté KevinOS natif.** L'état vit dans PostgreSQL/Redis/
   volumes, jamais dans le conteneur → mises à jour et migration K8s facilitées.
6. **IA pluggable.** Kevin AI parle à un **fournisseur abstrait** (local Ollama
   _ou_ API Cloud), configurable, sans changement de code applicatif.

## 5. Trajectoire vers Kubernetes (longévité)

Ce qui est fait **dès maintenant** pour ne pas se fermer la porte :

- Services **stateless**, config par **variables d'environnement / fichiers montés**.
- **Sans état local** dans les conteneurs (volumes nommés / stockage externe).
- **Un processus par conteneur**, healthchecks, logs sur stdout.
- **Images versionnées** (registry), pas de build « sur la machine ».

Le jour où le multi-nœud / la HA se justifient, on traduit les `docker-compose`
en manifests/Helm sans réécrire l'application. Détails et déclencheurs :
[ADR-0002](adr/ADR-0002-orchestration.md).
