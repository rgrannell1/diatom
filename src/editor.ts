import { Fzf, FzfResultItem } from "https://esm.sh/fzf";

import { Config, getEditor } from "./config.ts";
import { Vault } from "./vault.ts";
import { Note } from "./note.ts";

/**
 * Open a file in a chosen editor
 *
 * @export
 * @param {Config} config
 * @param {string} fpath
 */
export async function openNote(config: Config, fpath: string, editor?: string) {
  const selected = getEditor(config, editor);

  try {
    const proc = Deno.run({
      cmd: selected.open_note.map((bit: string) =>
        bit.replace("$fpath", fpath)
      ),
    });

    await proc.status();
  } catch (err) {
    if (err instanceof Error) {
      console.error(`failed to open ${fpath}; ${err.message}`);
      Deno.exit(1);
    }
    throw err;
  }
}

/**
 * Open a folder in a chosen editor
 *
 * @export
 * @param {Config} config
 * @param {string} fpath
 */
export async function openVault(config: Config, editor?: string) {
  const selected = getEditor(config, editor);
  const proc = Deno.run({
    cmd: selected.open_folder.map((bit: string) =>
      bit.replace("$fpath", config.vault)
    ),
  });

  await proc.status();
}
