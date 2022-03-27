import { Config } from "./config.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";
import * as Axon from "https://raw.githubusercontent.com/rgrannell1/axon/main/mod.ts";

export type State = {
  pathHashes: Record<string, string>;
  cacheKey: string;
  updated: string[];
};

/**
 * Represents a Vault containing all markdown notes,
 * and how to access information from it
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

  async *things(state: State) {
    for await (const note of this.notes()) {
      if (!state.updated.includes(note.fpath)) {
        continue
      }

      for await (const thing of note.things()) {
        yield thing
      }
    }
  }

  /**
   * Scan for cursory changes in the vault
   *   since the previous scan. Return a list of updated paths that can be selectively
   *   updated, for performance
   *
   * @param {Record<string, string>} state
   *
   * @return {*}  {Promise<Record<string, string>>}
   *
   * @memberof Vault
   */
  async scan(state: Partial<State>): Promise<State> {
    const pathHashes: Record<string, string> = {};

    for await (const note of this.notes()) {
      const hash = await note.hash(false);
      pathHashes[note.fpath] = hash;
    }

    const cacheKey = Axon.id.apply(null, Object.values(pathHashes).sort());
    const updated: string[] = [];

    for (const [fpath, hash] of Object.entries(pathHashes)) {
      if (!state.pathHashes || state.pathHashes.hasOwnProperty(hash)) {
        updated.push(fpath);
      } else if (state.pathHashes && state.pathHashes[fpath] !== hash) {
        updated.push(fpath);
      }
    }

    return {
      pathHashes,
      cacheKey,
      updated,
    };
  }
}

/**
 * A Markdown note
 *
 * @export
 * @class Note
 */
export class Note {
  vault: Vault;
  fpath: string;
  fname: string;
  content?: string;

  constructor(vault: Vault, file: any) {
    this.vault = vault;
    this.fpath = file.path;
    this.fname = file.name;
  }

  /**
   * Hash this file (read and cache if needed)
   *
   * @param {boolean} [cache=false]
   * @return {*}  {Promise<string>}
   * @memberof Note
   */
  async hash(cache = false): Promise<string> {
    if (this.content) {
      return Axon.id(this.content);
    }

    var content = (await Deno.readFile(this.fpath)).toString();

    if (cache) {
      this.content = content.toString();
    }

    return Axon.id(content).toString();
  }

  *things() {
    // parse frontmatter, body
    // yield that stuff
    // yiled metadata too
  }
}

/**
 * Extract triples from note frontmatter
 *
 * @export
 * @class Frontmatter
 */
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
    // just read the yaml, and substitute
  }
}

/**
 * Extract triples from the markdown body
 *
 * @export
 * @class MarkdownBody
 */
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
    // read the markdown
    // hashes
    // file-size
    // wordcount
  }
}
