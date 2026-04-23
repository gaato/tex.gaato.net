type MathJaxAdaptor = {
  serializeXML: (node: unknown) => string;
  tags: (node: unknown, tagName: string) => unknown[];
};

type MathJaxRuntime = {
  startup: {
    adaptor: MathJaxAdaptor;
    promise: Promise<void>;
  };
  tex2svgPromise: (latex: string, options?: Record<string, unknown>) => Promise<unknown>;
};

type MathJaxConfig = {
  loader: {
    paths: {
      mathjax: string;
    };
    load: string[];
    require: (file: string) => Promise<unknown>;
  };
  output: {
    font: string;
    fontCache: string;
  };
};

const emSize = 16;
const exSize = 8;
const containerWidth = 80 * emSize;

let mathJaxRuntimePromise: Promise<MathJaxRuntime> | null = null;

function getSvgFromSerializedNode(output: string): string {
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

async function getMathJax(): Promise<MathJaxRuntime> {
  if (!mathJaxRuntimePromise) {
    mathJaxRuntimePromise = (async (): Promise<MathJaxRuntime> => {
      const globalMathJax = globalThis as { MathJax?: MathJaxRuntime | MathJaxConfig };

      if (!globalMathJax.MathJax || !('startup' in globalMathJax.MathJax)) {
        globalMathJax.MathJax = {
          loader: {
            paths: {
              mathjax: 'mathjax'
            },
            load: ['input/tex', 'output/svg', 'adaptors/liteDOM'],
            require: (file: string) => import(file)
          },
          output: {
            font: 'mathjax-newcm',
            fontCache: 'none'
          }
        } satisfies MathJaxConfig;

        await import('mathjax/startup.js');
      }

      const mathJax = globalMathJax.MathJax as MathJaxRuntime;
      await mathJax.startup.promise;
      return mathJax;
    })();
  }

  return mathJaxRuntimePromise;
}

export async function renderSvg(latex: string): Promise<string> {
  const mathJax = await getMathJax();
  const node = await mathJax.tex2svgPromise(latex, {
    display: true,
    em: emSize,
    ex: exSize,
    containerWidth
  });

  const serialized = mathJax.startup.adaptor.serializeXML(
    mathJax.startup.adaptor.tags(node, 'svg')[0]
  );
  const svg = getSvgFromSerializedNode(serialized);

  throwIfLatexError(svg);

  return svg;
}
