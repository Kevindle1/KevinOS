# syntax=docker/dockerfile:1
#
# Image du KevinOS Core — build multi-étapes, non-root, minimal.
# Construit depuis la RACINE du monorepo :
#   docker build -f apps/core/Dockerfile -t kevinos/core:0.1.0 .

# --- Étape 1 : dépendances + build -------------------------------------------
FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /repo

# Manifestes d'abord (cache de couches efficace).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/core/package.json apps/core/
RUN pnpm install --frozen-lockfile

# Sources + build du paquet partagé puis du Core.
COPY packages/shared/ packages/shared/
COPY apps/core/ apps/core/
RUN pnpm --filter @kevinos/shared build \
    && pnpm --filter @kevinos/core build

# Élague les devDependencies pour ne garder que le runtime.
RUN pnpm --filter @kevinos/core --prod deploy /app

# --- Étape 2 : image d'exécution ---------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Utilisateur non-root (durcissement — voir docs/05-securite.md §3.5).
COPY --from=build --chown=node:node /app /app
USER node

EXPOSE 8080

# Healthcheck aligné sur la sonde de liveness du Core.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.KEVINOS_PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
