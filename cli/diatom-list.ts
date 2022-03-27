#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Models from "../src/models.ts";
import * as Config from "../src/config.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_LIST_FILES_CLI = `
Usage:
  diatom list files [--count]
  diatom (-h|--help)

Description:
  List files in a diatom markdown vault

Options:
  --count    Count the number of matches
`;

export async function listFiles(argv: string[]) {
  const args = docopt(DIATOM_LIST_FILES_CLI, { argv, allowExtra: true });

  const config = await Config.read();

  if (args.files) {
    const vault = new Models.Vault(config);

    if (args["--count"]) {
      let counter = 0;

      for await (const file of vault.notes()) {
        counter++;
      }

      console.log(counter);
      return;
    }
    for await (const file of vault.notes()) {
      console.log(file.fpath);
    }
  }
}

export const DIATOM_LIST_CLI = `
Usage:
  diatom list <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  List files

Commands:
  list files    create a file

Options:
  --count    Count the number of matches
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_LIST_CLI, { argv, allowExtra: true });

  if (args["<command>"] === "files") {
    await listFiles(argv);
  } else {
    throw new Error("diatom: not implemented");
  }
}
