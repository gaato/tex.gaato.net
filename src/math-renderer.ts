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

type MathJaxGlobal = {
  _: {
    mathjax: {
      mathjax: {
        document: (html: string, options: Record<string, unknown>) => unknown;
      };
    };
    input: {
      tex_ts: {
        TeX: new (options?: Record<string, unknown>) => unknown;
      };
    };
    output: {
      svg_ts: {
        SVG: new (options?: Record<string, unknown>) => unknown;
      };
    };
    adaptors?: {
      liteAdaptor?: {
        liteAdaptor?: (options?: Record<string, unknown>) => unknown;
      };
    };
    handlers: {
      html_ts: {
        RegisterHTMLHandler: (adaptor: unknown) => void;
      };
    };
  };
};

let mathJaxContextPromise: Promise<MathJaxContext> | null = null;

function getMathJaxGlobal(): MathJaxGlobal {
  const mathJax = (globalThis as { MathJax?: unknown }).MathJax as MathJaxGlobal | undefined;
  if (!mathJax) {
    throw new Error('MathJax is unavailable.');
  }

  return mathJax;
}

async function getMathJax(): Promise<MathJaxContext> {
  if (!mathJaxContextPromise) {
    mathJaxContextPromise = (async (): Promise<MathJaxContext> => {
      await import('mathjax/tex-svg.js');
      await import('mathjax/adaptors/liteDOM.js');

      const mathJax = getMathJaxGlobal();
      const liteAdaptor = mathJax._.adaptors?.liteAdaptor?.liteAdaptor;
      const registerHtmlHandler = mathJax._.handlers.html_ts.RegisterHTMLHandler;

      if (typeof liteAdaptor !== 'function') {
        throw new Error('MathJax lite adaptor is unavailable.');
      }

      const adaptor = liteAdaptor();
      registerHtmlHandler(adaptor);

      const input = new mathJax._.input.tex_ts.TeX({
        packages: ['base', 'ams']
      });
      const output = new mathJax._.output.svg_ts.SVG({
        fontCache: 'none'
      });

      const document = mathJax._.mathjax.mathjax.document('', {
        InputJax: input,
        OutputJax: output
      }) as MathJaxDocument;

      return { document, adaptor: adaptor as MathJaxAdaptor };
    })();
  }

  return mathJaxContextPromise;
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