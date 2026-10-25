# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package.json turbo.json ./
COPY apps/dashboard/package.json ./apps/dashboard/

RUN yarn install

COPY apps/dashboard ./apps/dashboard
WORKDIR /app/apps/dashboard
RUN yarn build

# Stage 2: Runner (Nginx Unprivileged / Alpine)
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

