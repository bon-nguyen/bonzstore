# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for Docker layer caching
COPY package.json turbo.json ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN yarn install

# Copy backend source and Prisma schema
COPY apps/api ./apps/api

# Generate Prisma Client (using dummy URL to avoid build-time env error) and compile NestJS
WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN yarn build

# Stage 2: Runner (Minimal & Non-Root User)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules, compiled output, and Prisma schema
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

# Run as non-root user (Least Privilege Principle)
USER node

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]

