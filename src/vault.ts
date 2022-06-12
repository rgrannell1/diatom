import { Config } from "./config.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";

import * as Axon from "https://raw.githubusercontent.com/rgrannell1/axon/main/mod.ts";
import { Note } from "./note.ts";
import { Rewrite } from "./types.ts";
import { promptRewrite } from "./rewrite.ts";

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

  async map(fn: (note: Note, index: number) => Promise<any>) {
    let idx = 0;
    for await (const note of this.notes()) {
      await fn(note, idx);
      idx++;
    }
  }

  /*
   * Count note-files
   */
  async noteCount(): Promise<number> {
    let count = 0;
    for await (const _ of expandGlob(`${this.config.vault}/**.md`)) {
      count++;
    }

    return count;
  }

  async *notes(): AsyncGenerator<Note> {
    for await (const file of expandGlob(`${this.config.vault}/**.md`)) {
      yield new Note(this, file);
    }
  }

  /*
   * Enumerate all updated notes, and print the things in the note
   */
  async *things(state: State): AsyncGenerator<any> {
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
   * Trigger an automated or supervised rewrite of notes using provided
   * rule plugins.
   *
   * @param {boolean} unsupervised
   * @param {number} offset
   * @memberof Vault
   */
  async rewriteNotes(plugin: () => Rewrite[], unsupervised: boolean, offset: number) {
    await this.map(async (note: Note, idx: number) => {
      if (idx > offset) {
        await promptRewrite(note, plugin, unsupervised);
      }
    });
  }

  /**
   * Scan for cursory changes in the vault
   *   since the previous scan. Return a list of updated paths that can be selectively
   *   updated, for performance.
   *
   * NOTE: too large to use at the moment.
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
