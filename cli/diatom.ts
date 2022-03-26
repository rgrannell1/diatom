#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

export const DIATOM_CLI = `
Usage:
  diatom <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  Diatom

Commands:
  new
  export             Export things from diatom
`;

import { main as diatomNew } from "./diatom-new.ts";

const commands: Record<string, any> = {
  new: diatomNew,
};

const [command] = Deno.args;

if (commands.hasOwnProperty(command)) {
  await commands[command]();
} else {
  console.log(DIATOM_CLI);
  Deno.exit(1);
}
