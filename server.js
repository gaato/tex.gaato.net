const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');
const { JSDOM } = require('jsdom');
const express = require('express');
const bodyParser = require('body-parser');
const sharp = require('sharp');


const app = express();
const port = 3000;

app.use(bodyParser.json());

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

async function convertToSvg(latex) {
  try {
    const tex = new TeX({ packages: AllPackages });
    const svg = new SVG();
    const doc = mathjax.document('', { InputJax: tex, OutputJax: svg });
    const node = doc.convert(latex, { display: true, em: 16, ex: 8, containerWidth: 80 });

    const svgString = adaptor.outerHTML(node);
    const svgTag = svgString.match(/<svg[^>]*>[\s\S]*?<\/svg>/g)[0];

    // エラーをチェックする
    if (svgTag.includes('data-mjx-error')) {
      const errorTitle = svgTag.match(/title="([^"]+)"/)[1];
      throw new Error(errorTitle);
    }
    const dom = new JSDOM(svgTag);
    const textElements = dom.window.document.querySelectorAll('text');
    textElements.forEach(text => {
      text.setAttribute('font-family', 'Noto Serif CJK JP, serif');
    });
    const updatedSvgTag = dom.window.document.querySelector('svg').outerHTML;

    return updatedSvgTag;

  } catch (error) {
    throw new Error(`LaTeX error: ${error.message}`);
  }
}

app.post('/render/png', async (req, res) => {
  try {
    const latex = req.body.latex;
    if (!latex) {
      return res.status(400).send('LaTeX string is required.');
    }

    const svgString = await convertToSvg(latex);
    const padding = 20; // 余白のサイズ

    const image = await sharp(Buffer.from(svgString))
      .resize({ height: 500 })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 255, g: 255, b: 255, alpha: 1 } }) // 余白を追加
      .png()
      .toBuffer();

    res.contentType('image/png');
    res.send(image);
  } catch (error) {
    handleRenderingError(error, res);
  }
});

app.post('/render/svg', async (req, res) => {
  try {
    const latex = req.body.latex;
    if (!latex) {
      return res.status(400).send('LaTeX string is required.');
    }

    const svgString = await convertToSvg(latex);
    res.contentType('image/svg+xml');
    res.send(svgString);
  } catch (error) {
    handleRenderingError(error, res);
  }
});

function handleRenderingError(error, res) {
  if (error.message.startsWith('LaTeX error:')) {
    return res.status(400).send(error.message);
  }
  console.error(error);
  res.status(500).send('An error occurred while rendering the LaTeX string.');
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
