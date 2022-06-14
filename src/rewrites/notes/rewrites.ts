import Re from "../text/index.ts";

import { Rewrite } from "../../types.ts";

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

const addSuffix = (suffix: string) => {
  return (text: string) => {
    return `${text}${suffix}`;
  };
};

/*
 * Plugin rewrites
 *
 */
export function rules(): Rewrite[] {
  return [
    {
      name: "multiple-newlines-to-double",
      description: "collapse multiple newlines to a single newline",
      rewrite: multiNewlines.modify.bind(null, addSuffix("\n\n")),
    },
    {
      name: "unspaced-title-to-double",
      description: "Ensure there is a space after each H1 title",
      rewrite: unspacedTitle.modify.bind(null, addSuffix("\n")),
    },
    {
      name: "unspaced-quote-to-double",
      description: "Ensure there is a quote after each quote title",
      rewrite: unspacedQuote.modify.bind(null, addSuffix("\n")),
    },
  ];
}
