# tex.gaato.net

tex.gaato.net provides an endpoint to render LaTeX strings as SVG images.

## Runtime

- Cloudflare Workers compatible runtime
- TypeScript
- MathJax v4.1.0

## Setup

```bash
pnpm install
```

This project enforces dependency build-script policy in [pnpm-workspace.yaml](pnpm-workspace.yaml).
If a new dependency requires install scripts, explicitly review and allow it there.

## CI

```bash
pnpm install --frozen-lockfile
pnpm build
```

## Local run (Workers)

```bash
pnpm dev
```

This builds TypeScript and starts `wrangler dev` using [wrangler.toml](wrangler.toml).

## Deploy (Workers)

```bash
pnpm deploy
```

Before first deploy, authenticate once:

```bash
pnpm dlx wrangler login
```

### GitHub Actions deploy

The repository includes [deploy workflow](.github/workflows/deploy.yml).

Set the following repository secrets before using it:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Endpoints

### POST `/render`

Renders a LaTeX string as an SVG image.

#### Request Parameters

| Parameter | Type   | Description                   |
|-----------|--------|-------------------------------|
| latex     | string | LaTeX string to be rendered   |

#### Response

- **200 OK**
  - `image/svg+xml`: SVG image
- **400 Bad Request**
  - `text/plain`: Error message if the LaTeX string is missing or if there's a LaTeX syntax error
- **500 Internal Server Error**
  - `text/plain`: Error message if any other error occurs
