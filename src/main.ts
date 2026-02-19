import { renderSvg } from './math-renderer.js';

type RenderRequest = {
  latex?: unknown;
};

function textResponse(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8'
    }
  });
}

async function parseRequestBody(request: Request): Promise<RenderRequest | null> {
  try {
    const body = (await request.json()) as RenderRequest;
    return body;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== '/render/svg') {
      return textResponse(404, 'Not Found');
    }

    if (request.method !== 'POST') {
      return textResponse(405, 'Method Not Allowed');
    }

    const body = await parseRequestBody(request);
    if (!body || typeof body.latex !== 'string' || body.latex.trim().length === 0) {
      return textResponse(400, 'LaTeX string is required.');
    }

    try {
      const svg = await renderSvg(body.latex);
      return new Response(svg, {
        status: 200,
        headers: {
          'content-type': 'image/svg+xml; charset=utf-8'
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.startsWith('LaTeX error:')) {
        return textResponse(400, message);
      }

      return textResponse(500, 'An error occurred while rendering the LaTeX string.');
    }
  }
};