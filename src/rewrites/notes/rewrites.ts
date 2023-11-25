import Re from "../text/index.ts";

import { Rewrite } from "../../types.ts";

const addSuffix = (suffix: string) => {
  return (text: string) => {
    return `${text}${suffix}`;
  };
};

const Const = (text: string) => {
  return (_: string) => {
    return text;
  };
};

// -- match YAML frontmatter, capturing the yaml block's contents
const frontmatter = Re.firstCaptureGroup(/^---\n(.+)\n---/sm);

// -- match the first (and hopefully only!) markdown title, capturing the text
const title = Re.firstCaptureGroup(/^#\s+(.+)/m);

// -- match each wikilink, without inner parsing
const wikilinks = Re.eachMatch(/\[{2}[^\]]+\]{2}\S*/gm);

// -- match multiple newlines
const multiNewlines = Re.eachMatch(/\n{3,}/gm);

const unspacedTitle = Re.eachMatch(/^(#.+)\n(?=[^\n])/gm);

const unspacedQuote = Re.eachMatch(/^(\>.+)\n(?=[^\n\>])/gm);

// Quotes are rendered as this escaped mess
const escapedQuote = Re.eachMatch(/\&\#39;/g);

const ruleDefinitions: Rewrite[] = [
  {
    name: "multiple-newlines-to-double",
    description: "collapse multiple newlines to a single newline",
    rewrite: multiNewlines.modify(addSuffix("\n\n")),
  },
  {
    name: "unspaced-title-to-double",
    description: "Ensure there is a space after each H1 title",
    rewrite: unspacedTitle.modify(addSuffix("\n")),
  },
  {
    name: "unspaced-quote-to-double",
    description: "Ensure there is a quote after each quote title",
    rewrite: unspacedQuote.modify(addSuffix("\n")),
  },
  {
    name: "escaped-quote-to-unescaped",
    description: "unescape a quote to backslash quoted",
    rewrite: escapedQuote.modify(Const("'")),
  },
];

/*
 * Plugin rewrites for my personal notes
 */
export function rules(): Rewrite[] {
  return ruleDefinitions.filter((rule) => {
    return new Set([
      "multiple-newlines-to-double",
      "unspaced-quote-to-double",
      "escaped-quote-to-unescaped",
    ]).has(rule.name);
  });
}
