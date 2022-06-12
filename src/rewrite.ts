
import { Note } from "./note.ts";
import { Diff } from './diff.ts';
import { Rewrite } from './types.ts';


function applyRewrites(rewriter: () => Rewrite[], content: string) {
  return rewriter().reduce((modified, rule) => {
    return rule.rewrite(modified)
  }, content)
}

export const promptRewrite = async (note: Note, rewriter: () => Rewrite[], unsupervised: boolean) => {
  const text = await note.read();
  const updated = applyRewrites(rewriter, text);

  if (text === updated) {
    return;
  }

  if (!unsupervised) {
    console.clear();
    await Diff.diff(text, updated);

    if (prompt("Happy to continue?")?.toLowerCase() !== "y") {
      console.log("ok then!");
      return;
    }
  }

  await Deno.writeTextFile(note.fpath, updated);
};
