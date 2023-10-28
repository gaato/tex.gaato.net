import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { DOMParser } from "linkedom";
import server from "bunrest";
import sharp from "sharp";
import { BunResponse } from "bunrest/src/server/response";

const app = server();
const port = 3000;

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

function convertToSvg(latex: string) {
  try {
    const tex = new TeX({ packages: AllPackages });
    const svg = new SVG();
    const doc = mathjax.document("", { InputJax: tex, OutputJax: svg });
    const node = doc.convert(latex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 80,
    });

    const svgString = adaptor.outerHTML(node);
    const svgTag = svgString.match(/<svg[^>]*>[\s\S]*?<\/svg>/g)![0];

    // エラーをチェックする
    if (svgTag.includes("data-mjx-error")) {
      const errorTitle = svgTag.match(/title="([^"]+)"/)![1];
      throw new Error(errorTitle);
    }
    const document = new DOMParser().parseFromString(svgTag, "image/svg+xml")!;
    const textElements = document.getElementsByTagName("text");
    textElements.forEach((text) =>
      text.setAttribute("font-family", "Noto Serif CJK JP, serif"),
    );
    const updatedSvgTag = document.querySelector("svg")!.outerHTML;

    return updatedSvgTag;
  } catch (error: any) {
    throw new Error(`LaTeX error: ${error.message}`);
  }
}

app.post("/render/png", async (req, res) => {
  try {
    const latex = (req.body as { [key: string]: any })["latex"];
    if (!latex) {
      return res.status(400).send("LaTeX string is required.");
    }

    const svgString = convertToSvg(latex);
    const padding = 20; // 余白のサイズ

    const image: Uint8Array = await sharp(new TextEncoder().encode(svgString))
      .resize({ height: 100 })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      }) // 余白を追加
      .png()
      .toBuffer();

    res.status(200);
    res.setHeader("Content-Type", "image/png");
    res.send(image);
  } catch (error: any) {
    handleRenderingError(error, res);
  }
});

app.post("/render/svg", (req, res) => {
  try {
    const latex = (req.body as { [key: string]: any })["latex"];
    if (!latex) {
      return res.status(400).send("LaTeX string is required.");
    }

    const svgString = convertToSvg(latex);
    res.status(200);
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svgString);
  } catch (error) {
    handleRenderingError(error, res);
  }
});

function handleRenderingError(error: any, res: BunResponse) {
  if (error.message.startsWith("LaTeX error:")) {
    return res.status(400).send(error.message);
  }
  console.error(error);
  res.status(500).send("An error occurred while rendering the LaTeX string.");
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
