# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build the Vite app (all heavy lifting happens here / in CI, never
# on the deployment server). This stage is discarded; only dist/ is kept.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies from the lockfile. A BuildKit cache mount keeps the npm
# cache warm across builds so reinstalls are fast. (Do NOT set NODE_ENV here —
# the build needs devDependencies like vite.)
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Vite bakes VITE_* env vars into the bundle at build time. The Web3Forms key is
# passed as a build arg (from a GitHub Actions secret) so it never lives in git.
ARG VITE_WEB3FORMS_ACCESS_KEY=""
ENV VITE_WEB3FORMS_ACCESS_KEY=$VITE_WEB3FORMS_ACCESS_KEY

# Canonical/sitemap/OG URLs (src/data/seo.js) are generated from this instead
# of a hardcoded domain. Defaults to production so local `docker build`/`npm
# run build` still work without any extra setup.
ARG SITE_ORIGIN="https://viikkonro.fi"
ENV SITE_ORIGIN=$SITE_ORIGIN

COPY . .
# Client build + SSR build + static prerendering (see package.json "build").
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Serve the static build with a rootless (non-root) nginx on 3005.
# The final image contains only nginx + the compiled assets (small & fast).
# ─────────────────────────────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="viikkonro" \
      org.opencontainers.image.description="Viikko Nro – viikkolaskuri" \
      org.opencontainers.image.source="https://viikkonro.fi"

# SPA-aware nginx config that listens on 3005 (>1024, so it works rootless).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Compiled static site (prerendered HTML + hashed assets).
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3005/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
