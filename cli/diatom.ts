#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

export const DIATOM_CLI = `
Usage:
  diatom <command> [options] [<args>...]
  diatom (-h|--help)

Description:
  Diatom bridges your markdown notes with an Axon database. It:

  - Exports note information to Axon
  - Lists or counts notes
  - Creates new notes from a template file

Commands:
  list       List diatom files
  new        Construct new files
  open       Open a diatom resource
  rewrite    Rewrite diatom notes
`;

import { main as diatomNew } from "./diatom-new.ts";
import { main as diatomList } from "./diatom-list.ts";
import { main as diatomOpen } from "./diatom-open.ts";
import { main as diatomRewrite } from "./diatom-rewrite.ts";

const commands: Record<string, any> = {
  new: diatomNew,
  open: diatomOpen,
  list: diatomList,
  rewrite: diatomRewrite
};

const [command] = Deno.args;

if (commands.hasOwnProperty(command)) {
  await commands[command]();
} else {
  console.log(DIATOM_CLI);
  Deno.exit(1);
}
