---
name: docker-deployment
description: Best practices and guidelines for Docker deployment in a monorepo containing a React (Vite) frontend and NestJS backend.
license: MIT
metadata:
  author: system
  version: "1.0.0"
---

# Docker Deployment Guidelines & Best Practices

## 1. Minimal & Secure Base Images

- Always use specific, Alpine-based Node versions (e.g., `node:20-alpine`) to minimize attack surface and image size.
- For static frontend hosting, use `nginx:alpine` or `nginxinc/nginx-unprivileged:alpine` for non-root execution.

## 2. Multi-Stage Builds

- **Builder Stage**: Install all dependencies (including `devDependencies`), generate assets (e.g., Prisma client), and compile code (`tsc`, `vite build`).
- **Runner Stage**: Only copy the necessary compiled output (`dist`) and required configuration files. Never include raw TypeScript files or `devDependencies` in the final runner image.

## 3. Security (Least Privilege Principle)

- **Non-Root User**: Always run Node.js applications with a non-root user. The official Node image provides a `node` user by default.
  ```dockerfile
  USER node
  ```
- Set appropriate permissions for uploaded directories, ensuring the `node` user owns them.

## 4. Leverage Docker Cache

- Copy package files (`package.json`, `yarn.lock`) first and install dependencies before copying the rest of the application source code. This cache layer will only be invalidated when dependencies change, drastically speeding up build times.

## 5. Environment Variables & Build Args

- Frontend (React/Vite): Environment variables (e.g., `VITE_API_URL`) must be passed during the `build` phase via `ARG` since Vite compiles them into static HTML/JS files.
- Backend (NestJS): Environment variables are read at runtime dynamically. Never bake sensitive secrets into the image during the build phase. Wait until runtime to inject them via `docker run -e` or Docker Compose.

## 6. Process Management & Termination

- Node.js doesn't handle PID 1 signals (like SIGTERM/SIGINT) well by itself. Consider using `dumb-init` or ensure NestJS implements `app.enableShutdownHooks()` so the container shuts down gracefully without hanging waiting for connections to close.

## 7. Pruning Dependencies (Monorepo specific)

- In a monorepo, either use `yarn workspaces focus --production` or prune tools to ensure `node_modules` copied to the final image does not contain gigabytes of unused dev-dependencies.
