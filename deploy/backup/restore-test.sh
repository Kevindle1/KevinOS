#!/bin/sh
# Test de restauration : « une sauvegarde non testée n'existe pas » (ENF-30).
# Restaure le dernier snapshot dans un dossier jetable et vérifie sa présence.
#
# Usage :
#   docker compose -f compose/docker-compose.yml -f compose/docker-compose.backup.yml \
#     --env-file .env run --rm --entrypoint /usr/local/bin/restore-test.sh backup
set -eu

log() { echo "[restore-test $(date -u +%FT%TZ)] $*"; }

export RESTIC_PASSWORD_FILE="${RESTIC_PASSWORD_FILE:-/run/secrets/restic_password}"
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY requis}"

TARGET=/tmp/restore-test
rm -rf "$TARGET"
mkdir -p "$TARGET"

log "snapshots disponibles :"
restic snapshots --compact || true

log "restauration du dernier snapshot vers ${TARGET}"
restic restore latest --target "$TARGET"

if [ -z "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  log "ÉCHEC : rien n'a été restauré"
  exit 1
fi

log "contenu restauré (aperçu) :"
find "$TARGET" -maxdepth 3 | head -n 20

log "vérification de l'intégrité du dépôt"
restic check --read-data-subset=5%

log "OK — restauration vérifiée avec succès"
