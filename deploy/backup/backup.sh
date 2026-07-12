#!/bin/sh
# Sauvegarde KevinOS : dump logique PostgreSQL + snapshot Restic chiffré + rotation.
# Chiffrement au repos via RESTIC_PASSWORD_FILE (secret). ADR-0011.
set -eu

log() { echo "[backup $(date -u +%FT%TZ)] $*"; }

export RESTIC_PASSWORD_FILE="${RESTIC_PASSWORD_FILE:-/run/secrets/restic_password}"
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY requis}"

# Initialise le dépôt s'il n'existe pas encore (idempotent).
if ! restic cat config >/dev/null 2>&1; then
  log "dépôt Restic absent → initialisation dans ${RESTIC_REPOSITORY}"
  restic init
fi

DUMP_DIR=/tmp/kevinos-dumps
mkdir -p "$DUMP_DIR"

# Dump logique de PostgreSQL (cohérent), si une base est configurée.
if [ -n "${POSTGRES_HOST:-}" ]; then
  PGPASSWORD="$(cat /run/secrets/postgres_password)"
  export PGPASSWORD
  log "pg_dump de « ${POSTGRES_DB} » depuis ${POSTGRES_HOST}"
  pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -F c -f "$DUMP_DIR/${POSTGRES_DB}.dump"
  unset PGPASSWORD
fi

# Snapshot : le dump + les sources montées (données des modules, config…).
log "snapshot Restic (dumps + ${BACKUP_PATHS:-aucune source montée})"
# shellcheck disable=SC2086
restic backup --tag kevinos --host kevinos "$DUMP_DIR" ${BACKUP_PATHS:-}

# Rotation : politique de rétention (3-2-1, garde court + long terme).
log "rotation (forget --prune)"
# shellcheck disable=SC2086
restic forget --prune ${RESTIC_KEEP:---keep-daily 7 --keep-weekly 4 --keep-monthly 6}

# Nettoyage des dumps temporaires (ils sont déjà dans le snapshot).
rm -rf "$DUMP_DIR"

log "sauvegarde terminée avec succès"
