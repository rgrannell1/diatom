import { green } from "https://deno.land/std/fmt/colors.ts";
import {
  parseAll as yamlParse,
  stringify,
} from "https://deno.land/std@0.132.0/encoding/yaml.ts";

import { Note, TextFragment } from "./src/note.ts";
import { Entity } from "./utils.ts";

import { rewritePinboardBookmark } from "./rewrites/pinboard.ts";
import {
  removeDuplicates,
  rewriteObsidianNote,
} from "./rewrites/obsidian-note.ts";

/**
 * Update parent text with a text-fragment
 *
 * @param {string} total
 * @param {(TextFragment | undefined)} child
 * @return {*}
 */
export const updateText = (total: string, child: TextFragment | undefined) => {
  if (!child) {
    return total;
  }

  const [childText, childFocus] = child;

  return [
    total.slice(0, childFocus.start),
    childText,
    total.slice(childFocus.end, total.length),
  ].join("");
};

/**
 * Match multiple sequential regular-expressions, yielding positional
 * text-fragments
 *
 * @param {string} text
 * @param {RegExp[]} patterns
 * @return {*}  {Generator<TextFragment>}
 */
export function* matchSequence(
  text: string,
  patterns: RegExp[],
): Generator<TextFragment> {
  let lastIndex = 0;

  for (const pattern of patterns) {
    const sticky = new RegExp(pattern.source, `${pattern.flags}y`);
    sticky.lastIndex = lastIndex;

    const matches = text.match(sticky);
    if (!matches || matches.index === undefined) {
      return;
    }

    const [match] = matches;
    lastIndex = lastIndex + match.length;

    yield [match, { start: matches.index, end: lastIndex }];
  }
}

export const rewriteEntities = (entities: Entity[]) => {
  entities = entities.map(rewritePinboardBookmark);
  entities = entities.map(rewriteObsidianNote);

  removeDuplicates(entities);

  return entities;
};

export const showDiff = (original: string, updated: string) => {
  const originalLines = original.split("\n");
  const updatedLines = updated.split("\n");

  let maxLength = Math.max(originalLines.length, updatedLines.length);

  for (let idx = 0; idx < maxLength; idx++) {
    let left = originalLines[idx] ?? "";
    let right = updatedLines[idx] ?? "";

    console.log(`${left.padEnd(120)}${green("|")} ${right.padEnd(120)}`);
  }
};

// this junk is not core
export const rewriteNote = (text: string) => {
  const frontmatterBody = Array.from(
    matchSequence(text, [/^(---.+?---)/s, /(.+)/s]),
  );
  if (!frontmatterBody) {
    return;
  }

  const [$frontmatter] = frontmatterBody;
  const [fmText, fmSequence] = $frontmatter;

  const [fm] = (yamlParse(fmText) as any[]);

  // no entities in the frontmatter
  if (!fm) {
    return;
  }

  const rewrittenFrontmatter = rewriteEntities(fm);
  const yamlStr = "---\n" + stringify(rewrittenFrontmatter as any, {}) +
    "---";

  return updateText(text, [yamlStr, fmSequence]);
};

// todo move to vault
