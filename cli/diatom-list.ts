#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Config from "../src/config.ts";
import * as Editor from "../src/editor.ts";
import { Vault } from "../src/vault.ts";
import { Note } from "../src/note.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_LIST_FILES_CLI = `
Usage:
  diatom list notes [-c|--count] [-n|--name]
  diatom list notes [-c|--count] [-n|--name]
  diatom list notes [-r|--random] [-n|--name]
  diatom list notes [-o|--open] [-r|--random]
  diatom (-h|--help)

Description:
  List notes in a diatom markdown vault

Options:
  -o, --open     Open the file using the editor determined by $VISUAL
  -c, --count    Count the number of matches
  -r, --random   Select a random file
  -n, --name     Just show the file name, not the full path
`;

export async function listNotes(argv: string[]) {
  const args = docopt(DIATOM_LIST_FILES_CLI, { argv, allowExtra: true });

  const config = await Config.read();

  if (!args.notes) {
    return;
  }

  const vault = new Vault(config);

  if (args["--count"]) {
    let counter = 0;

    for await (const file of vault.notes()) {
      counter++;
    }

    console.log(counter);
    return;
  }

  let idx = 0;
  let selection: Note | undefined = undefined;

  for await (const file of vault.notes()) {
    if (args["--random"]) {
      // select random from iterator
      if (Math.floor(Math.random() * idx) === 0) {
        selection = file;
      }

      idx++;
    } else {
      if (args["--name"]) {
        console.log(file.fname);
      } else {
        console.log(file.fpath);
      }
    }
  }

  if (args["--random"]) {
    if (!selection) {
      throw new TypeError(`diatom: no files to choose from.`);
    }
    if (args["--name"]) {
      console.log(selection.fname);
    } else if (args["--open"]) {
      await Editor.openNote(config, selection.fpath);
    } else {
      console.log(selection.fpath);
    }
  }
}

export const DIATOM_LIST_CLI = `
Usage:
  diatom list <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  List notes

Commands:
  list notes    create a file

Options:
  -o,--open     Open the file using the editor determined by $VISUAL
  --random   Select a random file
  --count    Count the number of matches
  --name     Just show the file name, not the full path
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_LIST_CLI, { argv, allowExtra: true });

  if (args["<command>"] === "notes") {
    await listNotes(argv);
  } else {
    throw new Error("diatom: not implemented");
  }
}
