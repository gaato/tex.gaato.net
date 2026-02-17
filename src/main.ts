import Fastify from 'fastify';
import { z } from 'zod';
import { renderPng, renderSvg } from './math-renderer.js';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3000);
const bodySchema = z.object({
  latex: z.string().min(1)
});

app.post('/render/svg', async (request, reply) => {
  const parsed = bodySchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).type('text/plain').send('LaTeX string is required.');
  }

  try {
    const svg = await renderSvg(parsed.data.latex);
    return reply.type('image/svg+xml').send(svg);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.startsWith('LaTeX error:')) {
      return reply.status(400).type('text/plain').send(message);
    }

    request.log.error(error);
    return reply
      .status(500)
      .type('text/plain')
      .send('An error occurred while rendering the LaTeX string.');
  }
});

app.post('/render/png', async (request, reply) => {
  const parsed = bodySchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).type('text/plain').send('LaTeX string is required.');
  }

  try {
    const image = await renderPng(parsed.data.latex);
    return reply.type('image/png').send(image);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.startsWith('LaTeX error:')) {
      return reply.status(400).type('text/plain').send(message);
    }

    request.log.error(error);
    return reply
      .status(500)
      .type('text/plain')
      .send('An error occurred while rendering the LaTeX string.');
  }
});

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`Server is running at http://localhost:${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });