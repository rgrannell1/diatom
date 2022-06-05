#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

/*
 * An axon plugin. Accepts
 *
 * --plugin               Prints plugin information as JSON
 *
 * --fetch=<cache-date>   Accepts a previous cache-date and returns anything added after that
 *                          date.
 */

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

import { parse } from "https://deno.land/std@0.95.0/flags/mod.ts";

import * as Config from "../src/config.ts";
import { State, Vault } from "../src/vault.ts";

async function* readVault(vault: Vault, state: State) {
  for await (const thing of vault.things(state)) {
    yield thing;
  }
}


export const DIATOM_EXPORT_FILE_CLI = `
Usage:
  diatom export [(--plugin|--fetch)]
  diatom (-h|--help)

Description:
  Export note information as JSON

Options:
  --plugin    show Axon importer plugin information
  --fetch     fetch triples in Axon entity format
`;

export async function main(argv: string[]) {
  const args = docopt(DIATOM_EXPORT_FILE_CLI, { argv, allowExtra: true });
  const flags = parse(Deno.args);

  const config = await Config.read();
  const vault = new Vault(config);

  const state = JSON.parse(flags.fetch ?? "{}");
  const newState = await vault.scan(state);

  const plugin = {
    id: "Diatom Import Plugin",
    is: [
      "Axon/Plugin/Importer",
    ],
    cache_key: [[newState.cacheKey, "Identifier"]],
    date: [[new Date().toISOString(), "Date"]],
  };

  if (flags.plugin) {
    console.log(JSON.stringify(plugin));
  } else if (flags.fetch) {
    console.log(JSON.stringify(plugin));

    for await (const thing of readVault(vault, newState)) {
      console.log(JSON.stringify(thing));
    }
  } else {
    console.log("diatom: invalid export arguments provided");
    console.log(JSON.stringify(Deno.args));
    Deno.exit(1);
  }
}
