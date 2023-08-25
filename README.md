# tex.gaato.net

tex.gaato.net provides endpoints to render LaTeX strings as SVG or PNG images.

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
