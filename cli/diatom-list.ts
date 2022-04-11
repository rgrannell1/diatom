#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Models from "../src/models.ts";
import * as Config from "../src/config.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_LIST_FILES_CLI = `
Usage:
  diatom list files [--random] [--name]
  diatom list files [--count] [--name]
  diatom (-h|--help)

Description:
  List files in a diatom markdown vault

Options:
  --count    Count the number of matches
  --random   Select a random file
  --name     Just show the file name, not the full path
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

    let idx = 0
    let selection: Models.Note | undefined = undefined;

    for await (const file of vault.notes()) {
      if (args['--random']) {

        // select random from iterator
        if (Math.floor(Math.random() * idx) === 0) {
          selection = file;
        }

        idx++
      } else {
        if (args['--name']) {
          console.log(file.fname);
        } else {
          console.log(file.fpath);
        }
      }
    }

    if (args['--random']) {
      if (!selection) {
        throw new TypeError(`diatom: no files to choose from.`)
      }

      if (args['--name']) {
        console.log(selection.fname);
      } else {
        console.log(selection.fpath);
      }
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
  --random   Select a random file
  --count    Count the number of matches
  --name     Just show the file name, not the full path
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_LIST_CLI, { argv, allowExtra: true });

  if (args["<command>"] === "files") {
    await listFiles(argv);
  } else {
    throw new Error("diatom: not implemented");
  }
}
