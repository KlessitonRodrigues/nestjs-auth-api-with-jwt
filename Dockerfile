# ── Base ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# ── Install dependencies ──────────────────────────────────────────────────────
FROM base AS deps
COPY package.json yarn.lock turbo.json ./
COPY applications/task-manager-app/package.json ./applications/task-manager-app/
COPY services/authentication-api/package.json   ./services/authentication-api/
COPY services/task-manager-api/package.json     ./services/task-manager-api/
COPY services/aws-database/package.json         ./services/aws-database/
COPY packages/common-resources/package.json     ./packages/common-resources/
COPY packages/daisy-ui-components/package.json  ./packages/daisy-ui-components/
RUN yarn install --frozen-lockfile --network-timeout 600000

# ── Build NestJS services ─────────────────────────────────────────────────────
FROM deps AS nestjs-builder
COPY . .
RUN yarn turbo run build \
      --filter=@services/authentication-api \
      --filter=@services/task-manager-api

# ── Build NextJS app ──────────────────────────────────────────────────────────
FROM deps AS nextjs-builder
COPY . .
RUN yarn turbo run build --filter=@applications/task-manager-app

# ── Authentication API runtime ────────────────────────────────────────────────
FROM node:20-alpine AS auth-api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=nestjs-builder /app/node_modules                              ./node_modules
COPY --from=nestjs-builder /app/services/authentication-api/dist          ./dist
COPY --from=nestjs-builder /app/services/authentication-api/package.json  ./package.json
EXPOSE 3001
CMD ["node", "dist/main"]

# ── Task Manager API runtime ──────────────────────────────────────────────────
FROM node:20-alpine AS task-api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=nestjs-builder /app/node_modules                           ./node_modules
COPY --from=nestjs-builder /app/services/task-manager-api/dist         ./dist
COPY --from=nestjs-builder /app/services/task-manager-api/package.json ./package.json
EXPOSE 3002
CMD ["node", "dist/main"]

# ── NextJS runtime ────────────────────────────────────────────────────────────
FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=nextjs-builder /app/node_modules                                  ./node_modules
COPY --from=nextjs-builder /app/applications/task-manager-app/.next           ./.next
COPY --from=nextjs-builder /app/applications/task-manager-app/public          ./public
COPY --from=nextjs-builder /app/applications/task-manager-app/package.json    ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
