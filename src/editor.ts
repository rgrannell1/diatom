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
  const proc = Deno.run({
    cmd: selected.open_note.map((bit: string) => bit.replace("$fpath", fpath)),
  });

  await proc.status();
}

/**
 * Open a folder in a chosen editor
 *
 * @export
 * @param {Config} config
 * @param {string} fpath
 */
export async function openVault(config: Config) {
  const editor = getEditor(config);
  const proc = Deno.run({
    cmd: editor.open_folder.map((bit: string) =>
      bit.replace("$fpath", config.vault)
    ),
  });

  await proc.status();
}
