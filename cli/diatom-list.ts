#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Models from "../src/models.ts";
import * as Config from "../src/config.ts";

export const DIATOM_LIST_FILES_CLI = `
Usage:
  diatom list files
  diatom (-h|--help)

Description:
  List files
`;

export async function listFiles(argv: string[]) {
  const args = docopt(DIATOM_LIST_FILES_CLI, { argv, allowExtra: true });

  const config = await Config.read();

  if (args.files) {
    const vault = new Models.Vault(config);

    for await (const file of vault.notes()) {
      console.log(file.path);
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
`;

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export async function main(argv: string[]) {
  const args = docopt(DIATOM_LIST_CLI, { argv, allowExtra: true });

  if (args["<command>"] === "files") {
    await listFiles(argv);
  } else {
    throw new Error("diatom: not implemented");
  }
}
