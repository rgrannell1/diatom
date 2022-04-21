import { Config } from "./config.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";

import * as Axon from "https://raw.githubusercontent.com/rgrannell1/axon/main/mod.ts";
import * as Parsers from "./parser.ts";

/*
 * Vault state returned to Axon
 */
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
  subsumptions: Axon.Models.Subsumptions;

  constructor(config: Config) {
    this.config = config;
    this.subsumptions = new Axon.Models.Subsumptions();
  }

  async map(fn: (note: Note) => Promise<any>) {
    for await (const note of this.notes()) {
      await fn(note);
    }
  }

  async *notes() {
    for await (const file of expandGlob(`${this.config.vault}/**.md`)) {
      yield new Note(this, file);
    }
  }

  /*
   * Enumerate all updated notes, and print the things in the note
   */
  async *things(state: State) {
    for await (const note of this.notes()) {
      if (!state.updated.includes(note.fpath)) {
        continue;
      }

      for await (const thing of note.things()) {
        // add to subsumption tree
        if (thing.is) {
          for (
            const parent of Array.isArray(thing.is) ? thing.is : [thing.is]
          ) {
            this.subsumptions.add(thing.id, parent);
          }
        }

        if (thing.includes) {
          for (const child of thing.includes) {
            this.subsumptions.add(child, thing.id);
          }
        }

        yield thing;
      }
    }

    // todo move the knowledge model
    const concepts = new Set<string>();

    for (const tgts of Object.values(this.subsumptions.graph)) {
      for (const tgt of tgts) {
        concepts.add(tgt);
      }
    }

    for (const concept of concepts) {
      const parents = this.subsumptions.graph[concept];

      if (typeof parents === "undefined") {
        yield {
          id: concept,
          is: "Concept",
          parent: ["Axon_Thing"],
        };

        continue;
      }

      yield {
        id: concept,
        is: "Concept",
        parent: [...parents],
      };
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
   * Read (and possibly cache) file content
   *
   * @param {boolean} [cache=false]
   * @return {*}  {Promise<string>}
   *
   * @memberof Note
   */
  async read(cache = false): Promise<string> {
    if (this.content) {
      return this.content;
    }

    const content = (await Deno.readTextFile(this.fpath)).toString();
    if (cache) {
      this.content = content;
    }

    return content;
  }

  /**
   * Hash this file (read and cache if needed)
   *
   * @param {boolean} [cache=false]
   * @return {*}  {Promise<string>}
   * @memberof Note
   */
  async hash(cache = false): Promise<string> {
    return Axon.id(await this.read(cache));
  }

  async frontmatter() {
    const parser = new Parsers.NoteParser(this);
    return parser.frontmatter();
  }

  async *things() {
    const parser = new Parsers.NoteParser(this);

    for await (const thing of parser.things()) {
      yield thing;
    }
  }
}
