#!/bin/sh
# Ordonnanceur simple et robuste (offline, sans dépendance) : lance une
# sauvegarde au démarrage (optionnel) puis à intervalle régulier. Un cron précis
# pourra être introduit plus tard sans changer le reste (ADR-0011).
set -eu

: "${BACKUP_INTERVAL_HOURS:=24}"
: "${RUN_ON_STARTUP:=true}"

log() { echo "[backup-scheduler $(date -u +%FT%TZ)] $*"; }

if [ "$RUN_ON_STARTUP" = "true" ]; then
  log "sauvegarde initiale au démarrage"
  /usr/local/bin/backup.sh || log "ÉCHEC de la sauvegarde initiale (voir logs)"
fi

log "intervalle : toutes les ${BACKUP_INTERVAL_HOURS} h"
while true; do
  sleep "$((BACKUP_INTERVAL_HOURS * 3600))"
  log "déclenchement planifié"
  /usr/local/bin/backup.sh || log "ÉCHEC de la sauvegarde planifiée (voir logs)"
done
