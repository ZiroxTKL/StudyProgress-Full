FROM node:24-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
COPY web/package.json ./web/package.json
COPY mobile/package.json ./mobile/package.json
COPY packages/client/package.json ./packages/client/package.json
RUN npm ci --no-audit --no-fund
COPY packages/client ./packages/client
COPY web ./web
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build -w web

FROM caddy:2-alpine
COPY --from=build /build/web/dist /srv
COPY deploy/Caddyfile.local /etc/caddy/Caddyfile
EXPOSE 80 443
