import { Config } from "./config.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";

export class Vault {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async *notes() {
    for await (const file of expandGlob(`${this.config.vault}/**.md`)) {
      yield file;
    }
  }
}

export class Note {
  fpath: string;
  dpath: string;
  content?: string;

  constructor(dpath: string, fpath: string) {
    this.fpath = fpath;
    this.dpath = dpath;
  }

  async init() {
    this.content = await Deno.readTextFile(this.fpath);
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
