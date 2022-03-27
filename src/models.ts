import { Config } from "./config.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";



/**
 * Represents a Vault containing all markdown notes
 *
 * @export
 * @class Vault
 */
export class Vault {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async *notes() {
    for await (const file of expandGlob(`${this.config.vault}/**.md`)) {
      yield new Note(this, file);
    }
  }
}


/**
 * A Markdown note
 *
 * @export
 * @class Note
 */
export class Note {
  vault: Vault
  fpath: string
  fname: string

  constructor(vault: Vault, file: any) {
    this.vault = vault
    this.fpath = file.path
    this.fname = file.name
  }

  async init() {
    //this.content = await Deno.readTextFile(this.fpath);
  }

  hash(): string {
    return "";
  }

  *entities() {
  }
}

export class Frontmatter {
  fpath: string;
  dpath: string;
  content: string;

  constructor(dpath: string, fpath: string, content: string) {
    this.fpath = fpath;
    this.dpath = dpath;
    this.content = content;
  }

  *entities() {
  }
}

export class MarkdownBody {
  fpath: string;
  dpath: string;
  content: string;

  constructor(dpath: string, fpath: string, content: string) {
    this.fpath = fpath;
    this.dpath = dpath;
    this.content = content;
  }

  *entities() {
  }
}

export function main() {
}
