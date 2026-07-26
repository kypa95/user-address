# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Cache dependencies first
COPY package.json package-lock.json ./
RUN npm ci

# Build the app. Vite bakes env vars at build time, so VITE_API_URL must be
# present here — pass it with `--build-arg VITE_API_URL=...` (Render reads it
# from the service's environment). Defaults to a relative /api for the Docker
# Compose setup, where nginx proxies same-origin.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# The nginx image renders templates from /etc/nginx/templates with envsubst at
# startup, so ${PORT} is filled from the environment. Default 80 for Compose;
# Render overrides it with its own PORT.
ENV PORT=80
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
