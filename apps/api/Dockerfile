# Build context is the repo root (pnpm workspace) — build with:
#   docker build -f apps/api/Dockerfile -t amtarc-api .

FROM node:22-alpine AS base
# Prisma's query engine needs openssl on Alpine (musl).
RUN apk add --no-cache openssl
RUN corepack enable

FROM base AS builder
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build
# pnpm workspace packages hold symlinks into the root .pnpm store — copying
# apps/api/node_modules alone would ship dangling links. `pnpm deploy`
# resolves everything into a real, self-contained node_modules tree instead.
# Keeps devDependencies (default) because the `prisma` CLI is one, and the
# entrypoint needs it for `prisma migrate deploy`.
RUN pnpm --filter api deploy --legacy /prod/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /prod/api/node_modules ./node_modules
COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /prod/api/package.json ./package.json
COPY --from=builder /repo/apps/api/prisma ./prisma
COPY --from=builder /repo/apps/api/prisma.config.ts ./prisma.config.ts
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && mkdir -p ./uploads && chown -R app:app /app
USER app

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
