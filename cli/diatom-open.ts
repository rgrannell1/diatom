#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Editor from "../src/editor.ts";
import * as Config from "../src/config.ts";
import * as Constants from "../src/constants.ts";
import { join } from "https://deno.land/std@0.127.0/path/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_OPEN_CLI = `
Usage:
  diatom open
  diatom open file [<name>]
  diatom open vault
  diatom open config
  diatom (-h|--help)

Description:
  open files

Commands:
  open files    open a file
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_OPEN_CLI, { argv, allowExtra: true });

  const config = await Config.read();
  const name = args["<name>"];

  if (args.file) {
    if (!name) {
      console.error(`diatom open: filename not given`);
      Deno.exit(1);
    }

    const fname = name.endsWith(".md") ? name : `${name}.md`;
    const fpath = join(config.vault, fname);

    const pathExists = await exists(fpath);
    if (!pathExists) {
      console.error(`diatom open: ${fpath} does not exist`);
      Deno.exit(1);
    }

    return Editor.openNote(config, fpath);
  }

  if (args.vault) {
    return Editor.openVault(config)
  }

  if (args.config) {
    return Editor.openNote(config, Constants.CONFIG_PATH);
  }

  if (!name) {
    config.vault;
    return Editor.openVault(config);
  }
}
