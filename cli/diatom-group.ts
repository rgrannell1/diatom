#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Config from "../src/config.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_GROUP_CLI = `
Usage:
  diatom group <group-name> (--query <q>)
  diatom (-h|--help)

Description:
  Group note-files into a folder by facts

Options:
  -q, --query     The membership query
`;

export async function foobar(argv: string[]) {
  const config = await Config.read();

  // run query across files
  // find matching files
  // if folder exists, prompt?
  //
}

export async function main(argv: string[]) {
  const args = docopt(DIATOM_GROUP_CLI, { argv, allowExtra: true });

  await foobar(argv);
}
