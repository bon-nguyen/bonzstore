# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json turbo.json ./
COPY apps/web/package.json ./apps/web/

RUN yarn install

COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN yarn build

# Stage 2: Runner (Non-root user)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

