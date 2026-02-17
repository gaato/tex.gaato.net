# tex.gaato.net

tex.gaato.net は、LaTeX 文字列を SVG や PNG 画像としてレンダリングするためのエンドポイントを提供します。

## 動作環境

- Node.js v24+
- TypeScript
- MathJax v4.1.0

## セットアップ

```bash
pnpm install
```

依存パッケージの build script 実行ポリシーは [pnpm-workspace.yaml](pnpm-workspace.yaml) で固定しています。
新規依存で install script が必要な場合は、内容を確認して同ファイルに明示的に許可を追加してください。

## 開発起動

```bash
pnpm dev
```

## 本番起動

```bash
pnpm build
pnpm start
```

## CI

```bash
pnpm install --frozen-lockfile
pnpm build
```

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
