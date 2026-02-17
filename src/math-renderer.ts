import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);

type MathJaxApi = {
  init: (config: unknown) => Promise<unknown>;
  tex2svg: (latex: string, options: Record<string, unknown>) => unknown;
  startup: {
    adaptor: {
      serializeXML: (node: unknown) => string;
    };
  };
};

let mathJaxPromise: Promise<MathJaxApi> | null = null;

async function getMathJax(): Promise<MathJaxApi> {
  if (!mathJaxPromise) {
    if (!(globalThis as { MathJax?: object }).MathJax) {
      (globalThis as { MathJax?: object }).MathJax = {};
    }

    const mathJax = require('mathjax/node-main.cjs') as MathJaxApi;

    mathJaxPromise = mathJax
      .init({
        loader: { load: ['input/tex', 'output/svg'] }
      })
      .then(() => mathJax);
  }

  return mathJaxPromise;
}

function getSvgFromMathJaxOutput(output: string): string {
  const match = output.match(/<svg[^>]*>[\s\S]*<\/svg>/);
  if (!match) {
    throw new Error('MathJax output does not contain SVG.');
  }

  return match[0];
}

function throwIfLatexError(svg: string): void {
  if (!svg.includes('data-mjx-error')) {
    return;
  }

  const title = svg.match(/title="([^"]+)"/)?.[1] ?? 'Invalid LaTeX expression.';
  throw new Error(`LaTeX error: ${title}`);
}

export async function renderSvg(latex: string): Promise<string> {
  const mathJax = await getMathJax();
  const node = mathJax.tex2svg(latex, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 80
  });

  const serialized = mathJax.startup.adaptor.serializeXML(node);
  const svg = getSvgFromMathJaxOutput(serialized);

  throwIfLatexError(svg);

  return svg;
}

export async function renderPng(latex: string): Promise<Buffer> {
  const svg = await renderSvg(latex);
  const padding = 20;

  return sharp(Buffer.from(svg))
    .resize({ height: 500 })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toBuffer();
}