# Déploiement KevinOS — Runbook

Infrastructure-as-code du socle. Tout l'état déployable vit ici (ENF-09) : le
serveur ne contient rien qui ne soit pas dans Git (hors **secrets** et
**données**).

## Contenu

```
deploy/
├── compose/
│   ├── docker-compose.yml                 # socle : proxy, Authelia, core, postgres, redis
│   ├── docker-compose.backup.yml          # overlay : sauvegardes Restic
│   ├── docker-compose.observability.yml   # overlay : prometheus, grafana, loki, exporters…
│   └── observability/                      # prometheus.yml, alerts.yml, promtail.yml
├── authelia/                              # configuration SSO/MFA (+ gabarit users)
├── backup/                                # image de sauvegarde (Restic + scripts)
├── modules/                               # manifestes des modules intégrés (ADR-0005)
├── secrets/                               # gabarits *.example (secrets réels ignorés par Git)
└── .env.example                           # config NON sensible (copier en .env)
```

## Prérequis

- Docker Engine + Docker Compose v2
- Entrée DNS/hosts pour `*.kevinos.local` → serveur, p. ex. dans `/etc/hosts` :
  `192.168.1.x core.kevinos.local auth.kevinos.local grafana.kevinos.local`

## 1. Configuration & secrets

```bash
cd deploy
cp .env.example .env                 # config non sensible (domaine, log, modèle IA)

# Générer les secrets (voir secrets/README.md pour le détail)
cd secrets
for f in *.example; do cp "$f" "${f%.example}"; done
openssl rand -base64 48 > authelia_jwt_secret
openssl rand -base64 48 > authelia_session_secret
openssl rand -base64 48 > authelia_storage_encryption_key
openssl rand -base64 48 > postgres_password
openssl rand -base64 48 > redis_password
openssl rand -base64 48 > restic_password      # ⚠ COPIE HORS-LIGNE OBLIGATOIRE
openssl rand -base64 48 > grafana_admin_password
chmod 600 *
cd ..
```

Créer l'utilisateur admin Authelia :

```bash
cp authelia/users_database.yml.example authelia/users_database.yml
# Générer un hash puis le coller dans users_database.yml :
docker run --rm authelia/authelia:4.38 \
  authelia crypto hash generate argon2 --password 'VOTRE-MOT-DE-PASSE'
```

## 2. Démarrer le socle (proxy + SSO + Core + DB)

```bash
docker compose -f compose/docker-compose.yml --env-file .env up -d --build
```

Vérifier (l'accès au Core passe désormais par le portail SSO) :

```bash
docker compose -f compose/docker-compose.yml --env-file .env ps
# Ouvrir https://core.kevinos.local → redirection vers auth.kevinos.local (login + MFA)
```

## 3. Activer les sauvegardes (Restic)

```bash
docker compose -f compose/docker-compose.yml \
               -f compose/docker-compose.backup.yml --env-file .env up -d --build
```

**Tester une restauration** (indispensable — ENF-30, à refaire régulièrement) :

```bash
docker compose -f compose/docker-compose.yml -f compose/docker-compose.backup.yml \
  --env-file .env run --rm --entrypoint /usr/local/bin/restore-test.sh backup
```

> ⚠️ **Production** : relocaliser le dépôt `restic_repo` sur le **disque de
> sauvegarde dédié** (HDD SATA/USB) via un bind mount, pour un vrai 3-2-1.

## 4. Activer le monitoring (si la RAM le permet)

```bash
docker compose -f compose/docker-compose.yml \
               -f compose/docker-compose.observability.yml --env-file .env up -d
# Grafana : https://grafana.kevinos.local (derrière SSO ; admin / grafana_admin_password)
```

Fournit : métriques hôte (node-exporter) & conteneurs (cAdvisor), logs (promtail
→ Loki), **alertes** RAM / disque / service down (Prometheus `alerts.yml`),
supervision simple (Uptime Kuma).

## Validation de la configuration (sans démarrer)

```bash
# depuis la racine du repo
pnpm run deploy:config
```

## Principes appliqués

| Principe                                                    | Où                                 |
| ----------------------------------------------------------- | ---------------------------------- |
| Réseaux segmentés `edge`/`apps`/`data`                      | `docker-compose.yml`               |
| Base de données jamais exposée (`internal: true`)           | réseau `data`                      |
| Aucun port entrant hormis le proxy (ADR-0003)               | seul `reverse-proxy` publie 80/443 |
| **SSO + MFA devant chaque module** (ADR-0009)               | Authelia + ForwardAuth Traefik     |
| **Secrets par fichier, moindre privilège** (ADR-0010)       | `secrets:` + `*_FILE`              |
| **Sauvegardes chiffrées + test de restauration** (ADR-0011) | overlay `backup`                   |
| TLS partout, HTTP→HTTPS (ENF-20)                            | Traefik `websecure`                |
| Limites mémoire par service (ENF-10/11)                     | `deploy.resources.limits`          |
| Redémarrage auto (ENF-32)                                   | `restart: unless-stopped`          |
| Alertes RAM/disque/service down (ENF-31)                    | `observability/alerts.yml`         |

## Budget mémoire (indicatif)

| Ensemble                                           |        ~RAM |
| -------------------------------------------------- | ----------: |
| Socle (proxy + Authelia + Core + Postgres + Redis) |     ~1,7 Go |
| + sauvegardes (Restic)                             |   +~0,25 Go |
| + observabilité complète                           |    +~1,3 Go |
| **Total tout activé**                              | **~3,3 Go** |

Confortablement sous 16 Go → marge pour les modules métier des phases suivantes.
