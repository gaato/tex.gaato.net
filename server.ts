import { mathjax } from "npm:mathjax-full/js/mathjax.js";
import { TeX } from "npm:mathjax-full/js/input/tex.js";
import { SVG } from "npm:mathjax-full/js/output/svg.js";
import { liteAdaptor } from "npm:mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "npm:mathjax-full/js/handlers/html.js";
import { AllPackages } from "npm:mathjax-full/js/input/tex/AllPackages.js";
import { DOMParser } from "https://esm.sh/linkedom@0.16.1";
// @deno-types="npm:@types/express"
import { default as express, Response } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/sharp"
import sharp from "npm:sharp";

const app = express();
const port = 3000;

app.use(bodyParser.json());

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
      text.setAttribute("font-family", "Noto Serif CJK JP, serif")
    );
    const updatedSvgTag = document.querySelector("svg")!.outerHTML;

    return updatedSvgTag;
  } catch (error) {
    throw new Error(`LaTeX error: ${error.message}`);
  }
}

app.post("/render/png", async (req, res) => {
  try {
    const latex = req.body.latex;
    if (!latex) {
      return res.status(400).send("LaTeX string is required.");
    }

    const svgString = convertToSvg(latex);
    const padding = 20; // 余白のサイズ

    const image = await sharp(new TextEncoder().encode(svgString))
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

    res.contentType("image/png");
    res.send(image);
  } catch (error) {
    handleRenderingError(error, res);
  }
});

app.post("/render/svg", (req, res) => {
  try {
    const latex = req.body.latex;
    if (!latex) {
      return res.status(400).send("LaTeX string is required.");
    }

    const svgString = convertToSvg(latex);
    res.contentType("image/svg+xml");
    res.send(svgString);
  } catch (error) {
    handleRenderingError(error, res);
  }
});

function handleRenderingError(error: Error, res: Response) {
  if (error.message.startsWith("LaTeX error:")) {
    return res.status(400).send(error.message);
  }
  console.error(error);
  res.status(500).send("An error occurred while rendering the LaTeX string.");
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
