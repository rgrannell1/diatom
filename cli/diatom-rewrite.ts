#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import * as Config from "../src/config.ts";
import { Vault } from "../src/vault.ts";

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

export const DIATOM_REWRITE_CLI = `
Usage:
  diatom rewrite (--plugin=<fpath>) [--unsupervised] [--offset=<number>]
  diatom (-h|--help)

Description:
  Run rewrite rules against your notes, to avoid manual rewrites.

  ALWAYS maintain a copy of your notes (e.g via Git) to avoid losing data.

Options:
  --plugin=<fpath>     The location of the rewrite plugin that implements IRewritePlugin
  --unsupervised       Rewrite notes without reviewing diffs interactively
  --offset=<number>    Skip the first n files, useful in interactive mode [default: 0]
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_REWRITE_CLI, { argv, allowExtra: true });

  const config = await Config.read();
  const unsupervised = args["--unsupervised"];
  const offset = args["--offset"];

  const {rules} = await import(args['--plugin'])

  const vault = new Vault(config);
  await vault.rewriteNotes(rules, unsupervised, offset);
}
