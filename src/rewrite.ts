
import { Note } from "./note.ts";
import { Diff } from './diff.ts';
import { IRewritePlugin } from './types.ts';


function applyRewrites(rewriter: IRewritePlugin, content: string) {
  return rewriter.rules().reduce((modified, rule) => {
    return rule.rewrite(modified)
  }, content)
}

export const promptRewrite = async (note: Note, rewriter: IRewritePlugin, unsupervised: boolean) => {
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
