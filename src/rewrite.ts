import { Note } from "./note.ts";

import { rewriteNote, showDiff } from "./chop3.ts";

export const promptRewrite = async (note: Note, unsupervised: boolean) => {
  const text = await note.read();
  const updated = rewriteNote(text);

  if (!updated) {
    return;
  }

  if (!unsupervised) {
    console.clear();
    showDiff(text, updated);

    if (prompt("Happy to continue?")?.toLowerCase() !== "y") {
      console.log("ok then!");
      return;
    }
  }

  await Deno.writeTextFile(note.fpath, updated);
};
