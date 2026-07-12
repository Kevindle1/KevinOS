# 06 — Roadmap

> Feuille de route par phases. Priorité = **valeur + dépendances + budget RAM**,
> pas l'ordre du brief. Chaque phase a un objectif clair et des critères de fin.

---

## ✅ Décisions du propriétaire (étape 6 — validée le 2026-07-12)

1. **IA — 100 % local & gratuit** (Ollama + modèle léger : Gemma/Qwen/Phi), hors-ligne,
   **fournisseur interchangeable** ([ADR-0006](adr/ADR-0006-kai-ia-locale.md)). Pas
   d'API payante dans le cœur V1.
2. **KAI = point d'entrée unique** : _« toutes les interactions passent par KAI »_
   ([Vision KAI](07-vision-kai.md)).
3. **Zéro dépendance GPU** ; optimisé pour la config actuelle (16 Go, Docker Compose).
   Serveur dédié (≥ 32 Go puis GPU) **plus tard**, quand KevinOS sera mûr.
4. **Ordre de développement validé** (le _corps_ avant le _cerveau_) :

   | Ordre | Bloc                        | Correspond à                   |
   | ----: | --------------------------- | ------------------------------ |
   |     1 | **Infrastructure KevinOS**  | Phase 0 (socle) + KevinOS Core |
   |     2 | **Fichiers & stockage**     | Kevin Files / Cloud            |
   |     3 | **Photos**                  | Immich                         |
   |     4 | **Média**                   | Jellyfin (Plex option)         |
   |     5 | **Tableau de bord unifié**  | Kevin Dashboard                |
   |     6 | **Assistant KAI**           | Kevin AI (local)               |
   |     7 | **Domotique**               | Home Assistant                 |
   |     8 | **Modules complémentaires** | reste du catalogue             |

> ⚠️ Cet ordre **prime** sur le séquencement générique ci-dessous : KAI arrive
> **après** que le corps (infra, stockage, photos, média, dashboard) soit en place,
> pour qu'il ait de vrais modules à piloter dès son arrivée.

---

## ✅ Repriorisation validée (2026-07-12, mise à jour)

Le propriétaire confirme la règle : **aucune donnée métier stockée tant que le
socle sécurité + sauvegardes n'est pas terminé et validé.** Le plan immédiat :

|          Phase | Objectif                                             | Contenu                                                                                                                                |
| -------------: | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0** ✅ | Infrastructure KevinOS                               | Monorepo, Core, `docker-compose` du socle, versioning — **fait**                                                                       |
| **Phase 1** 🔜 | **Finaliser le socle**                               | **Authelia** (SSO+MFA), **Restic** (sauvegardes auto), **gestion des secrets**, **monitoring**, **validation complète de la sécurité** |
|    **Phase 2** | **Module Fichiers**                                  | Connecteur KevinOS de **stockage** (disques, sauvegardes, futurs fournisseurs de fichiers) — **pas** un clone de Nextcloud             |
|           Puis | Photos → Média → Dashboard → KAI → Domotique → reste | selon l'ordre validé                                                                                                                   |

> **Phase 2 — cadrage explicite** : l'objectif n'est pas de recréer Nextcloud,
> mais un **connecteur** exposant au Core un **contrat standard** pour gérer le
> stockage, les disques, les sauvegardes et de futurs fournisseurs de fichiers
> (voir [contrat de module](adr/ADR-0005-couche-integration-core.md) +
> [versioning](08-versioning.md)).

**Priorité absolue rappelée** : durer plusieurs années. On avance **plus
lentement avec une architecture exemplaire** plutôt que vite avec de la dette.

---

## Vue d'ensemble

| Phase  | Thème            | Objectif                                  | RAM cumulée approx.   |
| ------ | ---------------- | ----------------------------------------- | --------------------- |
| **P0** | Socle & sécurité | Fondations fiables et sûres               | ~3–4 Go               |
| **P1** | Première valeur  | Dashboard + 1 module données + IA de base | ~6–9 Go               |
| **P2** | Vie quotidienne  | Médias, domotique, agenda, automations    | ⚠ proche limite 16 Go |
| **P3** | Enrichissement   | Musique, livres, dev, finance, voix, SDK  | nécessite upgrade RAM |
| **P4** | Avancé           | Caméras (GPU), inventaire, downloader     | nécessite GPU         |
| **v2** | Sensible/lourd   | Mail, Santé                               | —                     |

> ⚠ **Dès P2**, activer tout en même temps dépasse 16 Go. On **active/désactive**
> les modules selon l'usage, ou on **upgrade** (RAM ≥ 32 Go, puis GPU).

---

## Phase 0 — Socle & sécurité _(le sol sur lequel tout repose)_

**But** : aucune donnée métier tant que le socle n'est pas sûr et sauvegardé.

- Reverse proxy + TLS.
- SSO/MFA (Authelia) + RBAC minimal.
- Segmentation réseau Docker (`edge`/`apps`/`data`/`observability`).
- VPN WireGuard opérationnel (accès distant).
- Monitoring : Prometheus + Grafana + Uptime Kuma + **alertes RAM/disque**.
- Logs : Loki + Promtail.
- CrowdSec.
- **Sauvegarde Restic + première restauration testée.**
- CI/CD de base (lint/test/build) + convention de commits + IaC en Git.

**Fin de phase** : je peux atteindre le serveur via VPN, tout est en HTTPS
derrière SSO, je reçois une alerte si un service tombe ou si le disque se remplit,
et **j'ai restauré une sauvegarde avec succès**.

## Phase 1 — Première valeur visible

**But** : le propriétaire _voit_ et _utilise_ KevinOS.

- **KevinOS Core** (API Gateway, registre, event bus, contrat de module).
- **Kevin Dashboard** : accueil vivant + 3 widgets réels (météo, état serveurs, notifications).
- **Un module de données** : Cloud/Files (Nextcloud/File Browser) **ou** Photos (Immich).
- **Kevin AI (base)** : chat langage naturel (local Ollama **ou** API), branché au Dashboard.
- **Kevin API** documentée (OpenAPI).
- Kevin DNS (AdGuard + Unbound), Kevin Password (Vaultwarden), widget Météo.

**Fin de phase** : correspond aux **critères d'acceptation v1** du
[cahier des charges §4](01-cahier-des-charges.md).

## Phase 2 — Vie quotidienne

- Kevin Media (Jellyfin), Kevin Home + Energy (Home Assistant), Kevin Calendar
  (Radicale/Nextcloud), Kevin Automation (n8n/Node-RED), Kevin CLI.
- Enrichissement Dashboard (films récents, photos récentes, conso énergie, maison).
- Kevin AI : **RAG** sur documents + **mémoire** persistante.

⚠ **Point de bascule RAM** : arbitrer entre modules simultanés ou planifier
l'upgrade.

## Phase 3 — Enrichissement

- Kevin Music (Navidrome), Kevin Books (Kavita), Kevin Dev (Gitea + code-server +
  CI), Kevin Finance (Actual).
- **Kevin Voice** : Whisper (STT) + Piper (TTS) sur Kevin AI.
- **Kevin SDK** (client TS).
- Kevin AI : **agents / planification** (actions multi-modules).

_Prérequis conseillé : upgrade RAM ≥ 32 Go._

## Phase 4 — Avancé (matériel dépendant)

- **Kevin Camera** (Frigate) — **requiert GPU/Coral**.
- Kevin Inventory (Homebox), Kevin Downloader (qBittorrent + *arr, **cadre légal**).
- Kevin AI : **vision**.

_Prérequis : GPU/accélérateur._

## v2 — Sensible / lourd

- **Kevin Mail** (Mailcow) — auto-hébergement mail : réputation IP, délivrabilité,
  maintenance élevée → décision dédiée le moment venu.
- **Kevin Health** — données de santé : cadre de confidentialité renforcé.
- Étude **Kubernetes** si multi-nœud/HA justifié ([ADR-0002](adr/ADR-0002-orchestration.md)).

---

## Trajectoire matérielle recommandée

| Jalon  | Déclencheur               | Action matérielle         |
| ------ | ------------------------- | ------------------------- |
| Fin P1 | RAM tendue                | Envisager **RAM 32 Go**   |
| P3     | Voix + IA locale sérieuse | **RAM 32 Go** confirmé    |
| P4     | Vision caméras            | **GPU / Coral TPU**       |
| v2/K8s | Multi-nœud                | 2ᵉ machine / mini-cluster |

---

## ✅ Étape 6 — Validée (2026-07-12)

Les arbitrages ont été rendus par le propriétaire (voir « Décisions » en haut de
ce document) :

1. **IA — 100 % local & gratuit** (pas d'hybride en V1). → [ADR-0006](adr/ADR-0006-kai-ia-locale.md)
2. **Ordre : infra → fichiers → photos → média → dashboard → KAI → domotique → reste.**
3. **Accès VPN par défaut**, aucun port entrant ouvert en Phase 0. → [ADR-0003](adr/ADR-0003-acces-distant-vpn.md)
4. **Pas d'upgrade immédiat** : optimiser 16 Go sans GPU ; serveur dédié plus tard.
5. **Reverse proxy** : **Traefik** retenu pour la découverte auto + TLS auto (le
   propriétaire a validé « les décisions proposées », dont cette recommandation). →
   [ADR-0007](adr/ADR-0007-reverse-proxy-traefik.md)

> **Étape 7 en cours** : initialisation du **socle Phase 0** (monorepo, KevinOS
> Core, `docker-compose` du socle, IaC, CI) — documenté, testé, versionné.
