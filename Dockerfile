# pnpm image definition
FROM node:18 as pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Caching of NPM packages
FROM pnpm as fetcher
WORKDIR /app
COPY pnpm-lock.yaml .
RUN pnpm fetch --prod --frozen-lockfile

# Install of NPM packages
FROM pnpm as builder
WORKDIR /app
COPY --from=fetcher /root/.local/share/pnpm/store/v3 /root/.local/share/pnpm/store/v3
COPY --from=fetcher /app/node_modules /app/node_modules
COPY --from=fetcher /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY package.json .
RUN pnpm install --offline --prod --frozen-lockfile

# Production image: Using Bun as a runner
FROM oven/bun:alpine
WORKDIR /app
RUN apk --no-cache add font-noto-cjk-extra libstdc++
COPY --from=builder /app/node_modules /app/node_modules
COPY src src
EXPOSE 3000

CMD [ "bun", "run", "src/index.ts" ]
