# Build context is the repo root (pnpm workspace) — build with:
#   docker build -f apps/web/Dockerfile -t amtarc-web .

FROM node:22-alpine AS base
RUN corepack enable

FROM base AS builder
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile
COPY apps/web apps/web
# Server-only env vars read at build time by next.config.ts / route handlers
# that need a value even during the build step. Real values are supplied at
# container runtime — build-time values here only need to satisfy validation.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build

# Next traces workspace deps into .next/standalone, so the runtime image
# only needs that folder plus static assets — no node_modules copy needed.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public
USER app

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
