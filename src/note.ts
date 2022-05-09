import * as Axon from "https://raw.githubusercontent.com/rgrannell1/axon/main/mod.ts";
import * as Parsers from "./parser.ts";
import { Vault } from "./vault.ts";

export type TextFragment = [string, { start: number; end: number }];

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
    const parser = new Parsers.NoteParser(this as any);
    return parser.frontmatter();
  }

  async *things() {
    const parser = new Parsers.NoteParser(this as any);

    for await (const thing of parser.things()) {
      yield thing;
    }
  }
}
