#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Config from "../src/config.ts";

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
}
