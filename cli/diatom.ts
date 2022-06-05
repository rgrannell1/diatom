#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import { bold, cyan, gray } from "https://deno.land/std/fmt/colors.ts";
import { basename } from "https://deno.land/std/path/mod.ts";

import * as Config from "../src/config.ts";
import { Vault } from "../src/vault.ts";

const vault = new Vault(await Config.read());
let counts = await vault.noteCount();

const vaultUri = `${basename(vault.config.vault)}`;

export const DIATOM_CLI = `
${bold("diatom")} 📚
${gray("---------------------------------------------")}
${counts} notes in ${gray(vaultUri)}

List notes:
  ${cyan("di list notes")}
Create a note:
  ${cyan("di new note <title>")}
Open a note:
  ${cyan("di open note <title>")}
Open diatom vault:
  ${cyan("di open vault")}
Apply rewriters to notes
  ${cyan("di rewrite")}

${gray("---------------------------------------------")}
${
  gray("di list notes") + cyan(" • ") + gray("di new note") + cyan(" • ") +
  gray("di open note") + cyan(" • ") + gray("di open vault") + cyan(" • ") +
  gray("di rewrite") + cyan(" • ") + gray("di export")
}
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
