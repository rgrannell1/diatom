#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Editor from "../src/editor.ts";
import * as Config from "../src/config.ts";
import * as Template from "../src/template.ts";
import { join } from "https://deno.land/std@0.127.0/path/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";

export const DIATOM_NEW_FILE_CLI = `
Usage:
  diatom new file (<name>)
  diatom (-h|--help)

Description:
  Create a file from a template, then open it. If the file already exists, just
  open it.
`;

export async function newFile(argv: string[]) {
  const args = docopt(DIATOM_NEW_FILE_CLI, { argv, allowExtra: true });

  const config = await Config.read();
  const name = args["<name>"];
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

  await Editor.open(config, fpath);
}

export const DIATOM_NEW_CLI = `
Usage:
  diatom new <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  Create files and other items in your diatom notes

Commands:
  new file    create a file
`;

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export async function main(argv: string[]) {
  const args = docopt(DIATOM_NEW_CLI, { argv, allowExtra: true });

  if (args["<command>"] === "file") {
    await newFile(argv);
  } else {
    throw new Error("diatom: not implemented");
  }
}
