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

import { parse } from "https://deno.land/std@0.95.0/flags/mod.ts";

import * as Config from "../src/config.ts";
import { State, Vault } from "../src/vault.ts";

async function* readVault(vault: Vault, state: State) {
  for await (const thing of vault.things(state)) {
    yield thing;
  }
}

export async function main() {
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
    console.log("diatom: invalid arguments provided");
    console.log(JSON.stringify(Deno.args));
    Deno.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
