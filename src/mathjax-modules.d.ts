declare module 'mathjax/core.js' {
  export const mathjax: {
    document: (html: string, options: Record<string, unknown>) => unknown;
  };
  export const MathJax: unknown;
}

declare module 'mathjax/input/tex.js' {
  export class TeX {
    constructor(options?: Record<string, unknown>);
  }
}

declare module 'mathjax/output/svg.js' {
  export class SVG {
    constructor(options?: Record<string, unknown>);
  }
}

declare module 'mathjax/adaptors/liteDOM.js' {
  export function liteAdaptor(options?: Record<string, unknown>): unknown;
}
