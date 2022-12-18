#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

/*
 * Yield semantic data from Axon in entity-format
 *
 */

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

import * as Config from "../src/config.ts";
import { State, Vault } from "../src/vault.ts";

async function* readVault(vault: Vault, state: State) {
  for await (const thing of vault.things(state)) {
    yield thing;
  }
}

export const DIATOM_EXPORT_FILE_CLI = `
Usage:
  diatom export
  diatom (-h|--help)

Description:
  Export note information as JSON
`;

export async function main(argv: string[]) {
  docopt(DIATOM_EXPORT_FILE_CLI, { argv, allowExtra: true });

  const config = await Config.read();
  const vault = new Vault(config);

  const state = await vault.scan({});

  for await (const thing of readVault(vault, state)) {
    console.log(JSON.stringify(thing));
  }
}
