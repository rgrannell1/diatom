#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import { join } from "https://deno.land/std/path/mod.ts";
import { Fzf } from "https://cdn.skypack.dev/fzf";

import * as Config from "../src/config.ts";
import * as Editor from "../src/editor.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_OPEN_CLI = `
Usage:
  diatom open
  diatom open note [<name>] [--editor <editor-name>]
  diatom open vault [--editor <editor-name>]
  diatom open config
  diatom (-h|--help)

Description:
  open notes

Options:
  --editor <editor-name>    Open the file using the selected editor.

Commands:
  open files    open a file
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_OPEN_CLI, { argv, allowExtra: true });

  const config = await Config.read();
  const name = args["<name>"];

  if (args.note) {
    let fpath = join(config.vault, name);

    await Editor.openNote(config, fpath, args["--editor"]);
  } else if (args.vault) {
    await Editor.openVault(config, args["--editor"]);
  } else {
    throw new Error("failed");
  }
}
