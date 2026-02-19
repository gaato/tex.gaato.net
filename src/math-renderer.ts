import { MathJax, mathjax } from 'mathjax/core.js';
import { TeX } from 'mathjax/input/tex.js';
import { SVG } from 'mathjax/output/svg.js';
import { liteAdaptor } from 'mathjax/adaptors/liteDOM.js';

type MathJaxDocument = {
  convert: (latex: string, options?: Record<string, unknown>) => unknown;
};

type MathJaxAdaptor = {
  outerHTML: (node: unknown) => string;
};

type MathJaxContext = {
  document: MathJaxDocument;
  adaptor: MathJaxAdaptor;
};

let mathJaxContext: MathJaxContext | null = null;

function getMathJax(): MathJaxContext {
  if (!mathJaxContext) {
    const adaptor = liteAdaptor();
    const registerHtmlHandler = (
      MathJax as {
        _?: {
          handlers?: {
            html_ts?: {
              RegisterHTMLHandler?: (adaptor: unknown) => void;
            };
          };
        };
      }
    )._?.handlers?.html_ts?.RegisterHTMLHandler;

    if (typeof registerHtmlHandler !== 'function') {
      throw new Error('MathJax HTML handler is unavailable.');
    }

    registerHtmlHandler(adaptor);

    const input = new TeX({
      packages: ['base', 'ams']
    });
    const output = new SVG({
      fontCache: 'none'
    });

    const document = mathjax.document('', {
      InputJax: input,
      OutputJax: output
    }) as MathJaxDocument;

    mathJaxContext = { document, adaptor: adaptor as MathJaxAdaptor };
  }

  return mathJaxContext;
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
  const mathJax = getMathJax();
  const node = mathJax.document.convert(latex, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 80
  });

  const serialized = mathJax.adaptor.outerHTML(node);
  const svg = getSvgFromMathJaxOutput(serialized);

  throwIfLatexError(svg);

  return svg;
}