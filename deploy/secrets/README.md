# Secrets KevinOS

> **Aucun secret réel n'est jamais committé.** Ce dossier ne contient que des
> **gabarits** (`*.example`) et ce mode d'emploi. Les vrais fichiers de secrets
> (sans `.example`) sont **ignorés par Git** (voir `.gitignore`) et vivent
> uniquement sur le serveur. Voir [ADR-0010](../../docs/adr/ADR-0010-gestion-secrets.md).

## Principe

KevinOS suit la convention **« secret par fichier »** : chaque secret est un
fichier monté en lecture seule dans le conteneur qui en a besoin. Les services
lisent le secret via la convention `*_FILE` (supportée par Authelia, PostgreSQL,
Restic, etc.), **jamais** via une variable d'environnement en clair — ainsi un
secret ne fuite pas dans `docker inspect`, les logs, ou l'historique shell.

## Générer les secrets (sur le serveur, une seule fois)

```bash
cd deploy/secrets

# Copier chaque gabarit vers son fichier réel
for f in *.example; do cp "$f" "${f%.example}"; done

# Générer des valeurs fortes
openssl rand -base64 48 > authelia_jwt_secret
openssl rand -base64 48 > authelia_session_secret
openssl rand -base64 48 > authelia_storage_encryption_key
openssl rand -base64 48 > postgres_password
openssl rand -base64 48 > redis_password
openssl rand -base64 48 > restic_password        # ⚠ SANS CETTE CLÉ, LES SAUVEGARDES SONT IRRÉCUPÉRABLES
openssl rand -base64 48 > grafana_admin_password

chmod 600 *            # lisibles par le seul propriétaire
```

> ⚠️ **`restic_password`** chiffre toutes les sauvegardes. **Conservez-en une
> copie hors-ligne** (papier / gestionnaire de mots de passe). Perdue = sauvegardes
> définitivement illisibles.

## Fichiers attendus

| Fichier                           | Utilisé par      | Rôle                                   |
| --------------------------------- | ---------------- | -------------------------------------- |
| `authelia_jwt_secret`             | Authelia         | signature des JWT d'identité           |
| `authelia_session_secret`         | Authelia         | chiffrement des sessions               |
| `authelia_storage_encryption_key` | Authelia         | chiffrement de la base Authelia        |
| `postgres_password`               | PostgreSQL, Core | mot de passe de la base                |
| `redis_password`                  | Redis, Authelia  | mot de passe du cache/sessions         |
| `restic_password`                 | Restic           | **clé de chiffrement des sauvegardes** |
| `grafana_admin_password`          | Grafana          | mot de passe admin du monitoring       |

## Rotation

Pour changer un secret : régénérer le fichier, redémarrer le service concerné.
Pour `restic_password`, ne jamais changer sans avoir migré/rechiffré le dépôt
(sinon les anciennes sauvegardes deviennent illisibles).

## Évolution (voir ADR-0010)

Cette approche « fichiers » est volontairement simple et **hors-ligne**. Un
gestionnaire chiffré (**SOPS + age**) est prévu pour permettre de versionner les
secrets _chiffrés_ dans Git le jour où plusieurs machines/environnements
existeront.
