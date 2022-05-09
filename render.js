import { marked } from "https://cdn.skypack.dev/marked";
import { parseAll } from "https://deno.land/std@0.132.0/encoding/yaml.ts";
const FULL_WIKILINK =
  /\[\[(?<tgt>.{0,500}?)\|(?<description>.{0,500}?)\]\](?<suffix>\w*)(\((?<rel>[\w|-]{0,99})\))?/;
const SHORT_WIKILINK =
  /\[\[(?<tgt>.{0,999}?)\]\](?<suffix>\w*)(\((?<rel>[\w|-]{0,99})\))?/;


const escapeHtml = (unsafe) => {
  return unsafe.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(
    ">",
    "&gt;",
  ).replaceAll('"', "&quot;").replaceAll("'", "&#039;");
};

function wikilinkRenderer(src) {
  const tgt = encodeURIComponent(src.target);
  const description = escapeHtml(src.description + src.suffix ?? "");

  if (src.rel) {
    const rel = encodeURI(src.rel);
    return `<a data-rel="${rel}" title="${rel}" href="${tgt}.html">${description}</a>`;
  } else {
    return `<a href="${tgt}.html">${description}</a>`;
  }
}

function wikilinkTokeniser(src) {
  const newLines = src.replaceAll('\n', '')
  const match = newLines.match(FULL_WIKILINK);
  if (match) {
    return {
      type: "wikilink",
      raw: src,
      rel: match.groups?.rel,
      target: match.groups?.tgt,
      description: match.groups?.description,
      suffix: match.groups?.suffix ?? ""
    };
  }

  const shortMatch = newLines.match(SHORT_WIKILINK);
  if (shortMatch) {
    return {
      type: "wikilink",
      raw: src,
      rel: shortMatch.groups?.rel,
      target: shortMatch.groups?.tgt,
      description: shortMatch.groups?.tgt,
      suffix: shortMatch.groups?.suffix ?? "",
    };
  }
}

const wikilinkExtension = {
  name: "wikilink",
  level: "inline",
  start(text) {
    return text.indexOf("[");
  },
  tokenizer: wikilinkTokeniser,
  renderer: wikilinkRenderer,
};


const frontmatterTokeniser = src => {
  const match = src.match(/(?<yaml>^---.+?---)/s);

  if (match) {
    return {
      type: "frontmatter",
      raw: match.groups?.yaml,
      data: parseAll(match.groups?.yaml)
    };
  }

}
const frontmatterRenderer = token => {
  return `<pre>${escapeHtml(token.raw)}</pre>`
}

const frontmatterExtension = {
  name: "frontmatter",
  level: "block",
  start(text) {
    return text.indexOf("-")
  },
  tokenizer: frontmatterTokeniser,
  renderer: frontmatterRenderer,
}





























const tokenizer = {
  codespan(src) {
    const match = src.match(/^(\${1,2}[^\$\n]+?\${1,2})/);

    if (match) {
      return {
        type: 'codespan',
        raw: match[0],
        text: match[1].trim()
      };
    }

    // return false to use original codespan tokenizer
    return false;
  }
};

marked.use({ tokenizer });



marked.use({ extensions: [frontmatterExtension, wikilinkExtension] });

const text = await Deno.readTextFile(
  "/home/rg/Drive/Obsidian/Statistical Mechanics.md",
);
const body = marked.parse(text, {}, undefined);

const html = `
<!DOCTYPE html>
<html>
  <head>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script>
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$']]]
        }
      };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <link href="css/marx.css" rel="stylesheet" type="text/css">
    <link href="css/style.css" rel="stylesheet" type="text/css">
  </head>
  <main>
  ${body}
  </main>
<html>
`;

console.log(html);
