# syntax=docker/dockerfile:1.7
# Roadmap 029: isolated image prototypes; shared VPS deployment needs its own gate.
FROM node:22-bookworm-slim AS build
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN corepack pnpm install --frozen-lockfile
RUN corepack pnpm --filter @bluedotatlas/web build \
    && corepack pnpm --filter @bluedotatlas/worker build \
    && test -f /workspace/apps/web/.next/standalone/apps/web/server.js

FROM node:22-bookworm-slim AS web
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /workspace/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /workspace/apps/web/public ./apps/web/public
WORKDIR /app/apps/web
USER node
EXPOSE 3000
CMD ["node", "server.js"]

# Synthetic-only worker deliberately not started in the default Compose profile.
FROM node:22-bookworm-slim AS worker
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /workspace ./
USER node
CMD ["node", "apps/worker/dist/run.js"]

# Optional 046 original-synthetic VPS worker: one container, no original footage.
# Never enabled by the default Compose profile.
FROM worker AS worker046
USER root
RUN apt-get update -qq && apt-get install -y --no-install-recommends ffmpeg python3 \
    && rm -rf /var/lib/apt/lists/*
USER node
CMD ["node", "apps/worker/dist/run-046.js"]

# One-shot DB migrations. Only explicitly enabled under the maintenance profile.
FROM build AS migrate
ENV NODE_ENV=production
WORKDIR /workspace
CMD ["node", "packages/db/dist/migrate.js"]

# Separate one-shot 046 private *still review only*. Existing web/worker046 targets unchanged.
# This is built only after explicit operator approval and runs without a network.
FROM worker046 AS pilot046preview
USER root
RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends chromium fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
ARG BDA_PILOT_046_GIT_SHA
RUN test -n "$BDA_PILOT_046_GIT_SHA" \
    && test -x /app/packages/video/node_modules/.bin/remotion
LABEL org.opencontainers.image.revision="$BDA_PILOT_046_GIT_SHA"
ENV HOME=/home/node
USER node
WORKDIR /app/packages/video
CMD ["/usr/bin/false"]
