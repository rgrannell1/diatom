
import { Config, getEditor } from "./config.ts";
import { join } from "https://deno.land/std@0.127.0/path/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";
import * as Template from "../src/template.ts";

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
 * Create a new note-file from a template
 *
 * @export
 * @param {Config} config
 * @param {string} fpath
 */
export async function newNote(config: Config, name: string, editor?: string) {
  if (name.length === 0) {
    return;
  }
  const fname = name.endsWith(".md") ? name : `${name}.md`;

  const fpath = join(config.vault, fname);
  const content = await Template.file({
    name: name.replace(/\.md$/, ""),
    date: (new Date()).toLocaleDateString("en-CA"),
  });

  const pathExists = await exists(fpath);
  if (!pathExists) {
    await Deno.writeFile(fpath, new TextEncoder().encode(content));
  }

  await openNote(config, fpath, editor);
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
