# tex.gaato.net

tex.gaato.net provides endpoints to render LaTeX strings as SVG or PNG images.

## Runtime

- Node.js v24+
- TypeScript
- MathJax v4.1.0

## Setup

```bash
pnpm install
```

This project enforces dependency build-script policy in [pnpm-workspace.yaml](pnpm-workspace.yaml).
If a new dependency requires install scripts, explicitly review and allow it there.

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm build
pnpm start
```

## CI

```bash
pnpm install --frozen-lockfile
pnpm build
```

## Endpoints

### POST `/render/png`

Renders a LaTeX string as a PNG image.

#### Request Parameters

| Parameter | Type   | Description                   |
|-----------|--------|-------------------------------|
| latex     | string | LaTeX string to be rendered   |

#### Response

- **200 OK**
  - `image/png`: PNG image
- **400 Bad Request**
  - `text/plain`: Error message if the LaTeX string is missing or if there's a LaTeX syntax error
- **500 Internal Server Error**
  - `text/plain`: Error message if any other error occurs

### POST `/render/svg`

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
