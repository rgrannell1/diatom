import { Note } from "./note.ts";
import { Diff } from "./diff.ts";
import { Rewrite } from "./types.ts";
import { delay } from "https://deno.land/std@0.144.0/async/mod.ts";

function applyRewrites(rules: () => Rewrite[], content: string) {
  return rules().reduce((modified, rule) => {
    return rule.rewrite(modified);
  }, content);
}

export const promptRewrite = async (
  note: Note,
  rewriter: () => Rewrite[],
  unsupervised: boolean,
) => {
  const text = await note.read();
  const updated = applyRewrites(rewriter, text);

  if (text === updated) {
    return;
  }

  if (!unsupervised) {
    console.clear();
    await Diff.diff(text, updated);

    const answer = prompt("Happy to continue? [y, yes]")?.toLowerCase();

    if (answer !== "y" && answer !== "yes" && typeof answer !== "undefined") {
      console.log("Skipping");
      await delay(750);

      return;
    }
  }

  console.clear();

  console.log(`📚 Rewrote ${note.fpath}`);
  await Deno.writeTextFile(note.fpath, updated);
};
