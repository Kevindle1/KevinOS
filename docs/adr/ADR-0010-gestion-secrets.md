# ADR-0010 — Gestion des secrets (fichiers + convention `*_FILE`, SOPS plus tard)

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Lié à** : [Sécurité §3.6](../05-securite.md), [ADR-0009](ADR-0009-authelia-sso-mfa.md).

## Contexte

KevinOS manipule des secrets sensibles : mots de passe de base de données, clés de
session/JWT Authelia, **clé de chiffrement des sauvegardes Restic** (perte =
sauvegardes irrécupérables), mot de passe Grafana, etc. Il faut une gestion :

- **hors Git** (aucun secret committé — ENF-23) ;
- **hors variables d'environnement en clair** (un secret en `environment:` fuite
  dans `docker inspect`, les logs, l'historique shell) ;
- **simple et offline** (Règle 2) — aucun coffre en ligne obligatoire ;
- **de moindre privilège** (un service ne voit que ses propres secrets).

## Options

1. **Secrets en variables d'environnement** (`.env`).
   - ➕ Simple.
   - ➖ Exposés via `docker inspect`, logs, dumps ; tout le processus les voit.
     Rejeté pour les secrets (l'`.env` ne garde que de la **config non sensible**).
2. **Docker secrets (fichiers montés) + convention `*_FILE`.**
   - ➕ Secret dans un **fichier** monté en lecture seule à `/run/secrets/<nom>`,
     **par service** (moindre privilège) ; lu via `*_FILE` (supporté par Authelia,
     PostgreSQL, Grafana, Restic…) ; jamais dans l'env. 100 % local.
   - ➖ Les fichiers vivent sur le serveur (pas versionnables tels quels).
3. **Gestionnaire chiffré versionnable (SOPS + age, ou Vault).**
   - ➕ Secrets **chiffrés dans Git**, multi-machines, rotation outillée.
   - ➖ Surdimensionné pour un nœud unique aujourd'hui ; ajoute un outil et une clé
     maître à gérer.

## Décision

**Aujourd'hui (nœud unique) : option 2** — secrets par **fichier**, convention
**`*_FILE`**, montés **par service** via le mécanisme `secrets:` de Docker Compose.

- Les fichiers réels vivent dans `deploy/secrets/`, **ignorés par Git** ; seuls
  les **gabarits** `*.example` et le `README.md` (mode d'emploi + commandes de
  génération) sont versionnés.
- L'`.env` ne contient plus **aucun** secret : uniquement de la configuration non
  sensible (domaine, niveau de log, modèle IA…).
- Chaque service ne reçoit que **les secrets dont il a besoin** (moindre privilège).

**Demain (multi-machines / plusieurs environnements) : option 3** — introduire
**SOPS + age** pour versionner les secrets _chiffrés_ dans Git, sans changer la
façon dont les conteneurs les consomment (toujours `*_FILE`).

## Conséquences

- ➕ Aucun secret dans Git ni dans l'environnement des conteneurs ; surface de
  fuite fortement réduite.
- ➕ Offline, sans dépendance à un coffre en ligne.
- ➕ La convention `*_FILE` est **stable** : passer à SOPS plus tard ne touchera
  pas les services (ils liront toujours un fichier).
- ➖ La sauvegarde/rotation des secrets est **manuelle** aujourd'hui (documentée
  dans `deploy/secrets/README.md`).
- ➖ Un secret perdu (notamment `restic_password`) est **irrécupérable** → copie
  hors-ligne obligatoire, rappelée dans la doc.

### Conséquences dans plusieurs années

- La convention `*_FILE` étant découplée de la _source_ du secret, l'arrivée de
  SOPS/Vault, d'un cluster, ou d'un déploiement Kubernetes (où les `Secret` se
  montent aussi en fichiers) se fera **sans réécrire les services**.
- Le point de vigilance permanent restera la **clé de chiffrement des
  sauvegardes** : sa préservation hors-ligne conditionne la survie des données.
