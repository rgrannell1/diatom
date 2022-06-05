#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Editor from "../src/editor.ts";
import * as Config from "../src/config.ts";
import * as Template from "../src/template.ts";
import { join } from "https://deno.land/std@0.127.0/path/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";

export const DIATOM_NEW_FILE_CLI = `
Usage:
  diatom new note [--editor <editor-name>] [--] [<name>...]
  diatom (-h|--help)

Description:
  Create a file from a template, then open it. If the file already exists, just
  open it.

Options:
  --editor <editor-name>    Open the file using the selected editor.
`;

const promptFilename = async () => {
  return (prompt("> name 📖:") ?? "").trim();
};

export async function newNote(argv: string[]) {
  const args = docopt(DIATOM_NEW_FILE_CLI, { argv, allowExtra: true });
  const config = await Config.read();
  const editor = args["--editor"];

  const names = (args["<name>"] ?? [])
    .map((name: string) => name.trim());

  if (names.length === 0) {
    names.push(await promptFilename());
  }

  for (const name of names) {
    if (name.length === 0) {
      continue;
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

    await Editor.openNote(config, fpath, editor);
  }
}

export const DIATOM_NEW_CLI = `
Usage:
  diatom new <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  Create note and other items in your diatom notes

Options:
  --editor <editor-name>    Open the note using the selected editor.

Commands:
  new note    create a note
`;

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export async function main(argv: string[]) {
  const args = docopt(DIATOM_NEW_CLI, { argv, allowExtra: true });

  if (args["<command>"] === "note") {
    await newNote(argv);
  } else {
    throw new Error("diatom: not implemented");
  }
}
