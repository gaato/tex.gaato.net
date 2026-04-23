FROM node:24-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

COPY src ./src
RUN pnpm build \
    && pnpm prune --prod

FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    LISTEN_HOST=0.0.0.0 \
    PORT=8080

RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin --no-create-home app

COPY --from=build /app/package.json /app/
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

USER app

EXPOSE 8080

CMD ["node", "dist/http-server.js"]
