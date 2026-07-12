# ADR-0011 — Sauvegardes avec Restic (3-2-1, chiffrées, testées)

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Lié à** : [Analyse §6](../00-analyse.md) (risque perte de données),
[Données](../diagrammes/donnees.md), [ADR-0010](ADR-0010-gestion-secrets.md).

## Contexte

Le socle doit être **récupérable avant** d'héberger la moindre donnée métier
(règle validée par le propriétaire). Sur un **nœud unique**, sans redondance, la
**sauvegarde est la première ligne de résilience**. Elle doit être : automatique,
**chiffrée au repos** (souveraineté), **hors-ligne** (Règle 2), déduplicée
(stockage limité ~3 To), et surtout **testée** — « une sauvegarde non testée
n'existe pas ».

## Options

1. **Restic**.
   - ➕ Chiffrement au repos par défaut, déduplication, snapshots incrémentaux,
     `restic check` (intégrité), multi-cibles (local, S3, SFTP…), un seul binaire.
   - ➖ Pas d'ordonnanceur intégré (à fournir).
2. **Kopia**.
   - ➕ Fonctionnalités proches, UI incluse.
   - ➖ Moins « un binaire, un script » ; UI superflue pour notre usage scripté.
3. **Duplicati**.
   - ➖ Historique de fiabilité plus discuté ; base d'état à surveiller.
4. **Wrapper tiers** (image restic « clé en main »).
   - ➖ Boîte noire ; on préfère des scripts **lisibles et versionnés**
     ([Règle 7](../REGLES-ARCHITECTURE.md), transparence).

## Décision

**Restic**, empaqueté dans une **image KevinOS dédiée et transparente**
(`deploy/backup/`) : Alpine + `restic` + client PostgreSQL + **scripts
versionnés** (`backup.sh`, `restore-test.sh`, `entrypoint.sh`).

- **Cohérence des données** : `pg_dump` (dump logique) **avant** le snapshot, plutôt
  que copier les fichiers bruts de PostgreSQL.
- **Chiffrement** : clé via `restic_password` (secret fichier — ADR-0010). Sans
  elle, les sauvegardes sont **irrécupérables** → copie hors-ligne obligatoire.
- **Ordonnancement** : simple et robuste (intervalle, sans dépendance) ; un cron
  précis pourra être ajouté sans rien changer d'autre.
- **Rétention** : `--keep-daily 7 --keep-weekly 4 --keep-monthly 6` + `prune`.
- **3-2-1** : le dépôt sera **relocalisé sur le disque de sauvegarde dédié**
  (HDD SATA/USB), et une **copie hors-site chiffrée** reste optionnelle.
- **Test de restauration** : `restore-test.sh` restaure le dernier snapshot dans
  un dossier jetable + `restic check` — à exécuter régulièrement (ENF-30).

## Conséquences

- ➕ Données **récupérables**, chiffrées, dédupliquées, testables — le socle peut
  accueillir des données en confiance.
- ➕ Transparence totale (scripts lisibles), offline, souverain.
- ➖ L'ordonnancement par intervalle n'est pas « à heure fixe » (acceptable pour un
  foyer ; améliorable).
- ➖ La cible par défaut est un volume Docker : **à relocaliser** sur un disque
  distinct pour un vrai 3-2-1 (documenté dans le runbook).

### Conséquences dans plusieurs années

- Restic supportant nativement les cibles distantes (S3, SFTP, rest-server), la
  **copie hors-site** ou multi-machines s'ajoutera **sans changer la mécanique**
  (mêmes scripts, autre `RESTIC_REPOSITORY`).
- Le point critique **permanent** reste la **clé de chiffrement** : sa
  préservation hors-ligne conditionne, à horizon de plusieurs années, la survie de
  toutes les données du foyer. C'est le seul secret dont la perte est
  irréversible — d'où son traitement particulier dans la doc.
