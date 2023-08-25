# tex.gaato.net

tex.gaato.net は、LaTeX 文字列を SVG や PNG 画像としてレンダリングするためのエンドポイントを提供します。

## エンドポイント

### POST `/render/png`

LaTeX 文字列を PNG 画像としてレンダリングします。

#### リクエストパラメータ

| パラメータ | 型     | 説明                   |
|------------|--------|------------------------|
| latex      | string | レンダリングする LaTeX 文字列 |

#### レスポンス

- **200 OK**
  - `image/png`: PNG 画像
- **400 Bad Request**
  - `text/plain`: LaTeX 文字列が不足している場合、または LaTeX の構文エラーが発生した場合のエラーメッセージ
- **500 Internal Server Error**
  - `text/plain`: その他のエラーが発生した場合のエラーメッセージ

### POST `/render/svg`

LaTeX 文字列を SVG 画像としてレンダリングします。

#### リクエストパラメータ

| パラメータ | 型     | 説明                   |
|------------|--------|------------------------|
| latex      | string | レンダリングする LaTeX 文字列 |

#### レスポンス

- **200 OK**
  - `image/svg+xml`: SVG 画像
- **400 Bad Request**
  - `text/plain`: LaTeX 文字列が不足している場合、または LaTeX の構文エラーが発生した場合のエラーメッセージ
- **500 Internal Server Error**
  - `text/plain`: その他のエラーが発生した場合のエラーメッセージ
