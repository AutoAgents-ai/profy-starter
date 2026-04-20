FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f bun.lock ]; then npm install -g bun && bun install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else npm install; fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG APP_PREFIX
ARG NEXT_PUBLIC_BASE_PATH
ENV APP_PREFIX=${APP_PREFIX}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

RUN if [ -f .env.prod ]; then cp .env.prod .env.production; else touch .env.production; fi \
    && npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./.env.production

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
