FROM node:24-trixie

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git \
       ca-certificates \
       fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /workspaces/${localWorkspaceFolderBasename}