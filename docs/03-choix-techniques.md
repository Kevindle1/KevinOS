# 03 — Choix techniques

> Étape 4. Chaque brique est justifiée. La stack imposée par le brief (React,
> TypeScript, Vite, Tailwind, Node, Express, Docker, PostgreSQL, Redis, Nginx,
> Socket.io, Prisma) est respectée ; on précise les compléments et les raisons.

---

## 1. Frontend — Kevin Dashboard

| Choix | Rôle | Justification |
|-------|------|---------------|
| **React 18 + TypeScript** | UI | Imposé ; écosystème, typage fort |
| **Vite** | Build/dev | Imposé ; démarrage instantané, HMR |
| **Tailwind CSS** | Style | Imposé ; design system cohérent, mode clair/sombre trivial |
| **TanStack Query** | Données serveur | Cache, revalidation, états de chargement propres |
| **Zustand** | État UI local | Léger, sans boilerplate (vs Redux) |
| **React Router** | Navigation | Standard |
| **socket.io-client** | Temps réel | Imposé ; widgets vivants, notifications push |
| **Vitest + Testing Library + Playwright** | Tests | Unitaires + e2e ciblés |

Design : **mobile-first**, thèmes clair/sombre via variables CSS, inspirations
Apple / Tesla / Nothing / Arc / Home Assistant (voir [CDC ENF-40](01-cahier-des-charges.md)).

## 2. Backend — KevinOS Core & services natifs

| Choix | Rôle | Justification |
|-------|------|---------------|
| **Node.js + TypeScript** | Runtime | Imposé ; un seul langage front/back |
| **Express** | HTTP/API Gateway | Imposé ; simple, mature, middleware riche |
| **Prisma** | ORM PostgreSQL | Imposé ; migrations typées, DX excellente |
| **Socket.io** | WebSocket temps réel | Imposé ; push dashboard, events |
| **Zod** | Validation | Schémas partagés front/back, sécurité des entrées |
| **Pino** | Logs structurés | JSON → Loki, performant |
| **BullMQ (sur Redis)** | Files de tâches | Jobs IA, sauvegardes, planifications |

**Architecture du code (Clean Architecture / DDD / SOLID — ENF-04) :**

```
src/
  domain/          # entités & règles métier pures (aucune dépendance techno)
  application/     # cas d'usage (orchestration), ports (interfaces)
  infrastructure/  # adaptateurs : Prisma, Redis, clients modules tiers, IA
  interfaces/      # entrée : routes Express, handlers Socket.io, CLI
```

Les **modules intégrés** (Immich, Jellyfin…) sont vus par le domaine comme des
**ports** (interfaces) ; leur client concret vit dans `infrastructure/`. C'est ce
qui rend les modules **remplaçables** (ENF-01).

## 3. Données

| Choix | Rôle | Justification |
|-------|------|---------------|
| **PostgreSQL** | Base relationnelle | Imposé ; robuste, JSONB, extensions |
| **pgvector** (extension) | Vecteurs RAG | Évite d'ajouter une base vectorielle dédiée (économie RAM) |
| **Redis** | Cache, sessions, files, pub/sub | Imposé ; sert aussi de bus léger et de backend BullMQ |
| **Stockage fichiers** | Photos/médias/docs | Sur volumes disques (SSD chaud / HDD froid), pas dans la DB |

> **Économie de RAM** : on **mutualise** une seule instance PostgreSQL et une
> seule Redis pour les services natifs quand c'est possible, avec des schémas/DB
> logiques séparés. Les apps tierces qui exigent leur propre base la gardent.

## 4. Infrastructure & réseau

| Choix | Rôle | Justification |
|-------|------|---------------|
| **Docker + Docker Compose** | Orchestration v1 | Imposé ; adapté au nœud unique ([ADR-0002](adr/ADR-0002-orchestration.md)) |
| **Reverse proxy** | Frontal TLS/routage | Voir arbitrage ci-dessous |
| **Authelia** (ou Authentik) | SSO + MFA | Portail d'auth devant les apps, ForwardAuth |
| **WireGuard** | VPN d'accès distant | Léger, rapide, chiffré ([ADR-0003](adr/ADR-0003-acces-distant-vpn.md)) |
| **AdGuard Home + Unbound** | DNS + filtrage | DNS local, anti-pub, résolveur récursif |
| **CrowdSec** | Détection/blocage intrusions | Alternative moderne à fail2ban, listes communautaires |

### Arbitrage reverse proxy : Nginx vs Traefik vs Caddy

| | Nginx (imposé) | Traefik | Caddy |
|---|---|---|---|
| TLS auto (Let's Encrypt) | Manuel/npm | ✅ natif | ✅ natif (le plus simple) |
| Découverte Docker (labels) | ❌ | ✅ | via plugin |
| Config | Fichiers | Labels/dynamique | Caddyfile minimal |
| Écosystème/perf | Énorme | Très bon | Bon |

**Décision** : le brief impose **Nginx** ; on le retient comme frontal. Pour la
**découverte dynamique** des nombreux conteneurs et le **TLS automatique**, on
évalue **Traefik en complément/alternative** au fil de l'eau (documenté en ADR si
on bascule). Objectif : ne pas éditer un fichier Nginx à la main à chaque module.

## 5. Intelligence — Kevin AI

| Couche | Choix | Justification |
|--------|-------|---------------|
| Runtime LLM local | **Ollama** | Simple, API standard, modèles quantisés |
| UI de chat brute | **OpenWebUI** (optionnel) | Interface de secours / debug modèles |
| Fournisseurs Cloud | **OpenAI, Claude, Gemini** | Bascule quand le local est trop lent (mode hybride) |
| Abstraction | **Provider pluggable** (port `LLMProvider`) | Changer de modèle sans changer le code |
| STT | **Whisper** (whisper.cpp / faster-whisper) | Voix → texte, local |
| TTS | **Piper** | Texte → voix, léger, local |
| Vision | **Frigate** (caméras) + modèles vision | ⚠ requiert GPU/Coral |
| RAG | **pgvector** + pipeline d'ingestion | Documents/notes du propriétaire |
| Mémoire | Tables Postgres + résumés vectorisés | Contexte long terme |
| Agents/plans | Orchestrateur maison (BullMQ + outils) | L'IA agit sur les modules via le Core |

> **Réalité 16 Go / CPU only** : un LLM 7B quantisé tourne mais **lentement**.
> Recommandation : **mode hybride** par défaut (local pour le simple/privé, API
> Cloud pour le lourd), et **100 % local** activable après upgrade GPU. À valider
> (question ouverte n°1 de l'[analyse](00-analyse.md)).

## 6. Observabilité

| Choix | Rôle |
|-------|------|
| **Prometheus** | Métriques (CPU, RAM, disque, up/down, métier) |
| **Grafana** | Tableaux de bord + alertes |
| **Loki + Promtail** | Logs centralisés (corrélés aux métriques) |
| **Uptime Kuma** | Supervision « service par service » simple + notifications |
| **node-exporter / cAdvisor** | Métriques hôte & conteneurs |

## 7. Sauvegarde

| Choix | Rôle |
|-------|------|
| **Restic** (ou **Kopia**) | Sauvegardes chiffrées, dédupliquées, incrémentales |
| Cible locale | HDD SATA dédié (données froides) |
| Cible secondaire | HDD USB + **hors-site optionnel** (règle 3-2-1) |
| Vérification | Tests de restauration périodiques (ENF-30) |

## 8. Outillage projet (qualité — ENF-05..09)

| Choix | Rôle |
|-------|------|
| **pnpm workspaces** | Monorepo ([ADR-0001](adr/ADR-0001-monorepo.md)) |
| **ESLint + Prettier** | Lint & format |
| **Vitest / Playwright** | Tests |
| **GitHub Actions** | CI/CD (lint, test, build, publication d'images) |
| **Conventional Commits + semver** | Versionnement & changelog |
| **Docker Buildx** | Images multi-arch, reproductibles |

## 9. Récapitulatif « imposé vs complément »

- **Imposé (respecté)** : React, TS, Vite, Tailwind, Node, Express, Docker,
  PostgreSQL, Redis, Nginx, Socket.io, Prisma.
- **Compléments justifiés** : Authelia, WireGuard, Prometheus/Grafana/Loki,
  Restic, Ollama, pgvector, BullMQ, CrowdSec, AdGuard, Traefik (à l'étude).

Chaque complément est **remplaçable** et **documenté** ; aucun ne verrouille le
projet.
