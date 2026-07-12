# 04 — Catalogue des modules

> Les 33 modules du brief, classés en **modules natifs** (KevinOS les construit)
> et **modules intégrés** (KevinOS orchestre l'existant). Chaque module a un
> **statut**, une **solution pressentie** et une **phase** de déploiement (voir
> [Roadmap](06-roadmap.md)).
>
> Statut : 🟢 Natif à construire · 🔵 Intégration existant · 🟡 Hybride ·
> ⚪ Reporté (v2+)

---

## 1. Modules natifs (le « liant » — cœur de la valeur KevinOS)

| Module | Statut | Description | Phase |
|--------|--------|-------------|-------|
| **KevinOS Core** | 🟢 | API Gateway, registre de services, config, bus d'événements | P0 |
| **Kevin Dashboard** | 🟢 | Interface unifiée React, widgets vivants | P0 |
| **Kevin AI** | 🟢 | Orchestrateur IA : chat, RAG, mémoire, agents | P1 |
| **Kevin API** | 🟢 | API publique documentée (OpenAPI) | P1 |
| **Kevin SDK** | 🟢 | Client TypeScript de l'API | P3 |
| **Kevin CLI** | 🟢 | Outil d'admin en ligne de commande (`kevin …`) | P2 |
| **Kevin Voice** | 🟡 | STT (Whisper) + TTS (Piper) branchés sur Kevin AI | P3 |
| **Kevin Automation** | 🟡 | Règles & scénarios ; s'appuie sur n8n/HA + Core | P2 |

## 2. Modules intégrés (best-of-breed open-source)

| Module | Statut | Solution retenue | Alternatives | Phase |
|--------|--------|------------------|--------------|-------|
| **Kevin Cloud** | 🔵 | Nextcloud | Seafile | P1 |
| **Kevin Files** | 🔵 | File Browser (ou via Nextcloud) | — | P1 |
| **Kevin Photos** | 🔵 | Immich | PhotoPrism | P1 |
| **Kevin Media** | 🔵 | Jellyfin | Plex | P2 |
| **Kevin Music** | 🔵 | Navidrome | — | P3 |
| **Kevin Books** | 🔵 | Kavita | Calibre-Web | P3 |
| **Kevin Backup** | 🔵 | Restic | Kopia, Duplicati | P0 |
| **Kevin VPN** | 🔵 | WireGuard (+ Headscale) | Tailscale | P0 |
| **Kevin Home** | 🔵 | Home Assistant | — | P2 |
| **Kevin Monitor** | 🔵 | Prometheus + Grafana + Uptime Kuma | Netdata | P0 |
| **Kevin Logs** | 🔵 | Loki + Promtail | — | P0 |
| **Kevin Security** | 🔵 | CrowdSec + Authelia | fail2ban, Authentik | P0 |
| **Kevin Network** | 🔵 | Reverse proxy + segmentation Docker | — | P0 |
| **Kevin DNS** | 🔵 | AdGuard Home + Unbound | Pi-hole | P1 |
| **Kevin Password** | 🔵 | Vaultwarden | — | P1 |
| **Kevin Calendar** | 🔵 | Radicale / Nextcloud (CalDAV/CardDAV) | Baïkal | P2 |
| **Kevin Camera** | 🔵 | Frigate ⚠ (GPU/Coral) | — | P4 |
| **Kevin Dev** | 🔵 | Gitea + code-server + CI (Woodpecker) | Forgejo | P3 |
| **Kevin Finance** | 🔵 | Actual | Firefly III | P3 |
| **Kevin Inventory** | 🔵 | Homebox | Grocy | P4 |
| **Kevin Downloader** | 🔵 | qBittorrent (+ *arr, cadre légal ⚠) | — | P4 |
| **Kevin Energy** | 🔵 | Home Assistant (module énergie) | — | P2 |
| **Kevin Weather** | 🟡 | Intégration API météo (widget Dashboard) | — | P1 |
| **Kevin Health** | ⚪ | À définir (données santé sensibles) | — | v2 |
| **Kevin Mail** | ⚪ | **Reporté** — serveur mail = trop lourd/risqué | Mailcow (futur) | v2 |

---

## 3. Contrat d'intégration (comment un module s'ajoute)

Pour respecter « modules indépendants et remplaçables » (ENF-01), tout module
intégré passe par un **contrat** géré par le Core :

1. **Déclaration** — le module est décrit dans un manifeste
   (`modules/<nom>/module.yaml`) : nom, image, réseau, healthcheck, route,
   icône, capacités exposées, niveau d'accès requis.
2. **Adaptateur** — si le Dashboard/IA doit lire ou piloter le module, un
   **adaptateur** (port + client) est écrit dans le Core `infrastructure/`. Le
   reste du système ne connaît que le **port** (interface), jamais l'app concrète.
3. **SSO** — le module est placé derrière le portail d'auth (ForwardAuth) ou
   configuré en OIDC quand il le supporte.
4. **Observabilité** — logs sur stdout (→ Loki), métriques exposées (→ Prometheus),
   check ajouté à Uptime Kuma.
5. **Sauvegarde** — ses volumes de données sont ajoutés au périmètre Restic.
6. **Ressources** — `mem_limit`/`cpus` déclarés (budget RAM).

> **Remplacer un module** (ex. Immich → PhotoPrism) = réécrire uniquement son
> **adaptateur** + son manifeste. Le Dashboard et l'IA ne changent pas.

## 4. Priorisation — logique

L'ordre suit la valeur et les dépendances, **pas** l'ordre du brief :

1. **P0 — Socle non négociable** : réseau, sécurité, sauvegarde, monitoring, VPN.
   *(Sans ça, rien d'autre ne doit tourner en confiance.)*
2. **P1 — Première valeur visible** : Core, Dashboard, un module de données
   (Cloud/Files ou Photos), Kevin AI de base, DNS, Password.
3. **P2 — Vie quotidienne** : Médias, Domotique/Énergie, Agenda, Automations, CLI.
4. **P3 — Enrichissement** : Musique, Livres, Dev, Finance, Voix, SDK.
5. **P4 — Avancé / matériel dépendant** : Caméras (GPU), Inventaire, Downloader.
6. **v2 — Sensible/lourd** : Mail, Santé.

Détail temporel et jalons : [06-roadmap.md](06-roadmap.md).
