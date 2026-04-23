import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import sharp from 'sharp';

import { renderSvg } from './math-renderer.js';

type RenderRequest = {
  latex?: unknown;
};

const host = process.env.LISTEN_HOST ?? '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '8080', 10);
const pngHeight = 500;
const pngPadding = 20;

function writeTextResponse(
  response: ServerResponse,
  statusCode: number,
  message: string
): void {
  response.writeHead(statusCode, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(message)
  });
  response.end(message);
}

function writeBinaryResponse(
  response: ServerResponse,
  statusCode: number,
  contentType: string,
  body: Buffer | string
): void {
  const payload = typeof body === 'string' ? Buffer.from(body) : body;
  response.writeHead(statusCode, {
    'content-type': contentType,
    'content-length': payload.length
  });
  response.end(payload);
}

async function parseRequestBody(request: IncomingMessage): Promise<RenderRequest | null> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as RenderRequest;
  } catch {
    return null;
  }
}

async function renderPng(latex: string): Promise<Buffer> {
  const svg = await renderSvg(latex);

  return sharp(Buffer.from(svg))
    .resize({ height: pngHeight })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({
      top: pngPadding,
      bottom: pngPadding,
      left: pngPadding,
      right: pngPadding,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toBuffer();
}

function getLatex(body: RenderRequest | null): string | null {
  if (!body || typeof body.latex !== 'string') {
    return null;
  }

  const latex = body.latex.trim();
  return latex.length > 0 ? latex : null;
}

async function handleRender(
  request: IncomingMessage,
  response: ServerResponse,
  path: '/render' | '/render/svg' | '/render/png'
): Promise<void> {
  if (request.method !== 'POST') {
    writeTextResponse(response, 405, 'Method Not Allowed');
    return;
  }

  const body = await parseRequestBody(request);
  const latex = getLatex(body);

  if (latex === null) {
    writeTextResponse(response, 400, 'LaTeX string is required.');
    return;
  }

  try {
    if (path === '/render/png') {
      const png = await renderPng(latex);
      writeBinaryResponse(response, 200, 'image/png', png);
      return;
    }

    const svg = await renderSvg(latex);
    writeBinaryResponse(response, 200, 'image/svg+xml; charset=utf-8', svg);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.startsWith('LaTeX error:')) {
      writeTextResponse(response, 400, message);
      return;
    }

    console.error(error);
    writeTextResponse(response, 500, 'An error occurred while rendering the LaTeX string.');
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    writeTextResponse(response, 200, 'OK');
    return;
  }

  if (url.pathname === '/render' || url.pathname === '/render/svg' || url.pathname === '/render/png') {
    await handleRender(request, response, url.pathname);
    return;
  }

  writeTextResponse(response, 404, 'Not Found');
});

server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
