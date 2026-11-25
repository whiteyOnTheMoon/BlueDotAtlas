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

# Optional 046 FFmpeg/SVG private prototype: no Chromium, no default Compose service.
# Offline source-only proof built separately; actual VPS use has an owner gate.
FROM worker046 AS pilot046ffmpeg
USER root
RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends librsvg2-bin fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
ARG BDA_PILOT_046_GIT_SHA
RUN test -n "$BDA_PILOT_046_GIT_SHA" && test -x /usr/bin/ffmpeg && test -x /usr/bin/rsvg-convert
LABEL org.opencontainers.image.revision="$BDA_PILOT_046_GIT_SHA"
ENV HOME=/home/node
USER node
WORKDIR /app
CMD ["/usr/bin/false"]

# 048 Script V2 narration: pinned local Kokoro TTS (no cloud speech service).
# Standalone Python image; the pinned model is SHA-verified at build time and
# baked in so the private run needs no network. Never in the default Compose profile.
FROM python:3.12-slim-bookworm AS pilotv2tts
RUN pip install --no-cache-dir --disable-pip-version-check \
      "kokoro-onnx==0.6.1" "onnxruntime==1.29.0" "phonemizer==3.6.0" "espeakng-loader==0.2.4" \
      "numpy==2.2.6" "scipy==1.16.3" \
    && useradd --uid 1000 --create-home bda
WORKDIR /app
COPY scripts/generate-tts-042.py scripts/generate-tts-v2.py scripts/
RUN python3 -I scripts/generate-tts-v2.py --fetch-model /opt/kokoro-v1.0 \
    && chmod -R a=rX /opt/kokoro-v1.0
COPY docs/pilot/60s-script-v2.scene.json docs/pilot/
ARG BDA_PILOT_046_GIT_SHA
RUN test -n "$BDA_PILOT_046_GIT_SHA"
LABEL org.opencontainers.image.revision="$BDA_PILOT_046_GIT_SHA"
ENV BDA_TTS_V2_MODEL_DIR=/opt/kokoro-v1.0 OMP_NUM_THREADS=1 PYTHONDONTWRITEBYTECODE=1 HOME=/home/bda
USER bda
CMD ["/usr/bin/false"]
