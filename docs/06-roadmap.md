# 06 — Roadmap

> Feuille de route par phases. Priorité = **valeur + dépendances + budget RAM**,
> pas l'ordre du brief. Chaque phase a un objectif clair et des critères de fin.

---

## Vue d'ensemble

| Phase | Thème | Objectif | RAM cumulée approx. |
|-------|-------|----------|---------------------|
| **P0** | Socle & sécurité | Fondations fiables et sûres | ~3–4 Go |
| **P1** | Première valeur | Dashboard + 1 module données + IA de base | ~6–9 Go |
| **P2** | Vie quotidienne | Médias, domotique, agenda, automations | ⚠ proche limite 16 Go |
| **P3** | Enrichissement | Musique, livres, dev, finance, voix, SDK | nécessite upgrade RAM |
| **P4** | Avancé | Caméras (GPU), inventaire, downloader | nécessite GPU |
| **v2** | Sensible/lourd | Mail, Santé | — |

> ⚠ **Dès P2**, activer tout en même temps dépasse 16 Go. On **active/désactive**
> les modules selon l'usage, ou on **upgrade** (RAM ≥ 32 Go, puis GPU).

---

## Phase 0 — Socle & sécurité *(le sol sur lequel tout repose)*

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

**But** : le propriétaire *voit* et *utilise* KevinOS.

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

*Prérequis conseillé : upgrade RAM ≥ 32 Go.*

## Phase 4 — Avancé (matériel dépendant)

- **Kevin Camera** (Frigate) — **requiert GPU/Coral**.
- Kevin Inventory (Homebox), Kevin Downloader (qBittorrent + *arr, **cadre légal**).
- Kevin AI : **vision**.

*Prérequis : GPU/accélérateur.*

## v2 — Sensible / lourd

- **Kevin Mail** (Mailcow) — auto-hébergement mail : réputation IP, délivrabilité,
  maintenance élevée → décision dédiée le moment venu.
- **Kevin Health** — données de santé : cadre de confidentialité renforcé.
- Étude **Kubernetes** si multi-nœud/HA justifié ([ADR-0002](adr/ADR-0002-orchestration.md)).

---

## Trajectoire matérielle recommandée

| Jalon | Déclencheur | Action matérielle |
|-------|-------------|-------------------|
| Fin P1 | RAM tendue | Envisager **RAM 32 Go** |
| P3 | Voix + IA locale sérieuse | **RAM 32 Go** confirmé |
| P4 | Vision caméras | **GPU / Coral TPU** |
| v2/K8s | Multi-nœud | 2ᵉ machine / mini-cluster |

---

## ✅ Étape 6 — Validation attendue (questions au propriétaire)

Avant de démarrer la Phase 0 (développement), merci de trancher :

1. **IA — hybride ou 100 % local ?** *(Reco : hybride au départ, 100 % local
   après upgrade GPU.)*
2. **Premier module de données en P1 : Cloud/Files ou Photos ?** *(Reco :
   commencer par celui dont le besoin est le plus fort au quotidien.)*
3. **Accès : VPN uniquement au départ ?** *(Reco : oui ; exposition publique
   seulement si besoin famille identifié.)*
4. **Upgrade RAM/GPU envisageable, et à quel horizon ?** *(Impacte l'ordre de P2/P3/P4.)*
5. **Reverse proxy : rester sur Nginx (imposé) ou autoriser Traefik** pour la
   découverte auto + TLS auto ? *(Reco : autoriser Traefik au vu du nombre de
   modules.)*
6. **Reverse proxy / port ouvert ?** confirmer qu'on **n'ouvre aucun port
   entrant** en Phase 0.

> Dès validation, je passe à l'**étape 7** en initialisant le **socle Phase 0**
> (structure monorepo, `docker-compose` du socle, IaC, CI) — toujours documenté,
> testé, versionné.
