# syntax=docker/dockerfile:1
#
# Image de sauvegarde KevinOS : Restic + client PostgreSQL, autonome et offline
# une fois construite (ADR-0011). Transparente : les scripts sont lisibles et
# versionnés, pas un wrapper opaque.

FROM alpine:3.20

# restic (dépôt community) + pg_dump (client Postgres) + fuseau horaire + CA.
RUN apk add --no-cache restic postgresql16-client tzdata ca-certificates

COPY entrypoint.sh backup.sh restore-test.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh \
    /usr/local/bin/backup.sh \
    /usr/local/bin/restore-test.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
