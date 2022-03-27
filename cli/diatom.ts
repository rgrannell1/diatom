#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

export const DIATOM_CLI = `
Usage:
  diatom <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  Diatom

Commands:
  list       List diatom files
  new        Construct new files
  export     Export things from diatom
`;

import { main as diatomNew } from "./diatom-new.ts";
import { main as diatomList } from "./diatom-list.ts";

const commands: Record<string, any> = {
  new: diatomNew,
  list: diatomList
};

const [command] = Deno.args;

if (commands.hasOwnProperty(command)) {
  await commands[command]();
} else {
  console.log(DIATOM_CLI);
  Deno.exit(1);
}
