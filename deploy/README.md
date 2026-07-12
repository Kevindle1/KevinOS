# Déploiement KevinOS — Runbook Phase 0

Infrastructure-as-code du socle. Tout l'état déployable vit ici (ENF-09) : le
serveur ne contient rien qui ne soit pas dans Git (hors secrets et données).

## Contenu

```
deploy/
├── compose/
│   ├── docker-compose.yml                 # socle : proxy, core, postgres, redis
│   ├── docker-compose.observability.yml   # overlay : prometheus, grafana, loki, uptime-kuma
│   └── observability/prometheus.yml
├── modules/                               # manifestes des modules intégrés (ADR-0005)
└── .env.example                           # gabarit de configuration (copier en .env)
```

## Prérequis

- Docker Engine + Docker Compose v2
- Une entrée DNS/hosts pour `*.kevinos.local` pointant vers le serveur
  (ex. dans `/etc/hosts` : `192.168.1.x core.kevinos.local grafana.kevinos.local`)

## Démarrage (socle)

```bash
cd deploy
cp .env.example .env
# → éditer .env et renseigner des secrets forts (openssl rand -base64 32)

docker compose -f compose/docker-compose.yml --env-file .env up -d --build
```

Vérifier :

```bash
docker compose -f compose/docker-compose.yml --env-file .env ps
curl -k https://core.kevinos.local/health     # → {"status":"ok",...}
curl -k https://core.kevinos.local/ready      # → {"status":"ready",...}
```

## Démarrage avec observabilité (si la RAM le permet)

```bash
docker compose \
  -f compose/docker-compose.yml \
  -f compose/docker-compose.observability.yml \
  --env-file .env up -d
# Grafana : https://grafana.kevinos.local  (admin / GRAFANA_ADMIN_PASSWORD)
```

## Validation de la configuration (sans démarrer)

```bash
pnpm run deploy:config        # = docker compose ... config
```

## Principes appliqués

| Principe                                               | Où                                   |
| ------------------------------------------------------ | ------------------------------------ |
| Réseaux segmentés `edge`/`apps`/`data`/`observability` | `docker-compose.yml`                 |
| Base de données jamais exposée (`internal: true`)      | réseau `data`                        |
| Aucun port entrant hormis le proxy (ADR-0003)          | seul `reverse-proxy` publie 80/443   |
| TLS partout, redirection HTTP→HTTPS (ENF-20)           | Traefik `websecure`                  |
| Limites mémoire par service (budget 16 Go, ENF-10/11)  | `deploy.resources.limits`            |
| Redémarrage auto (ENF-32)                              | `restart: unless-stopped`            |
| Healthchecks (mode dégradé, ENF-13/31)                 | chaque service                       |
| Secrets hors Git (ENF-23)                              | `.env` ignoré, `.env.example` fourni |

## Budget mémoire du socle (indicatif)

| Service                 |      Limite |
| ----------------------- | ----------: |
| reverse-proxy (Traefik) |      256 Mo |
| core                    |      256 Mo |
| postgres                |      768 Mo |
| redis                   |      256 Mo |
| **Socle total**         | **~1,5 Go** |
| + overlay observabilité |    +~1,1 Go |

Confortablement sous 16 Go → laisse la place aux modules métier des phases
suivantes (fichiers, photos, média…), à activer progressivement.

## À venir (phases suivantes)

- Sauvegarde **Restic** (service + planification) + première restauration testée.
- **Authelia** (SSO/MFA) en ForwardAuth devant les routers Traefik.
- **CrowdSec**, **AdGuard/Unbound**, **WireGuard**.
- Manifestes des premiers modules (`deploy/modules/`).
