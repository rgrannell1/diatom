import { BlockLexer } from "https://deno.land/x/markdown@v2.0.0/src/block-lexer.ts";
import {
  Token,
  TokenType,
} from "https://raw.githubusercontent.com/ubersl0th/markdown/master/src/interfaces.ts";
import { Note } from "./note.ts";

type Lexeme = Token & { typeLabel: string };

type ParserState = {
  typeLabel: string;
  wordCount: number;
  cursor: any;
  parent: any;
  tokens: any[];
  counts: Record<string, number>;
  headings: { text: string; depth: number }[];
};

// +++ Read each markdown token +++

const readHeading = (state: ParserState, lexeme: Lexeme) => {
  return lexeme;
};

/**
 * Read entities in a note file, and convert markdown to a machine-readable
 * entity format
 *
 * @export
 *
 * @class NoteParser
 */
export class NoteParser {
  note: Note;

  constructor(note: Note) {
    this.note = note;
  }

  /**
   * Update the state object, given a provided lexeme
   *
   * @param {ParserState} state
   * @param {(Token & { typeLabel: string })} lexeme
   *
   * @memberof NoteParser
   */
  readLexeme(state: ParserState, lexeme: Token & { typeLabel: string }) {
    if (typeof state.cursor === "undefined") {
      console.error("++++++++++++++++++++++++++++++++++++++++++");
      console.error(state);
      throw new Error(
        `state cursor is missing; see above state to help find the error!`,
      );
    }

    if (lexeme.typeLabel === "space") {
      state.cursor.tokens.push(lexeme);
      return;
    }

    if (lexeme.typeLabel === "heading") {
      state.wordCount += lexeme.text?.split(" ").length ?? 0;
      state.cursor.tokens.push(readHeading(state, lexeme));
      return;
    }

    if (lexeme.typeLabel === "text") {
      state.wordCount += lexeme.text?.split(" ").length ?? 0;
      state.cursor.tokens.push(lexeme);

      return;
    }

    if (lexeme.typeLabel === "listStart") {
      const list = {
        typeLabel: "list",
        parent: state.cursor,
        ordered: lexeme.ordered,
        tokens: [],
      };

      state.cursor.tokens.push(list);
      state.cursor = list;

      return;
    }

    if (lexeme.typeLabel === "listEnd") {
      state.cursor = state.cursor.parent;

      return;
    }

    // list items
    if (lexeme.typeLabel === "listItemStart") {
      const listItem = {
        typeLabel: "listItem",
        parent: state.cursor,
        tokens: [],
      };

      state.cursor.tokens.push(listItem);
      state.cursor = listItem;

      return;
    }

    if (lexeme.typeLabel === "listItemEnd") {
      state.cursor = state.cursor.parent;

      return;
    }

    // blockquotes
    if (lexeme.typeLabel === "blockquoteStart") {
      const listItem = {
        typeLabel: "blockquote",
        parent: state.cursor,
        tokens: [],
      };

      state.cursor.tokens.push(listItem);
      state.cursor = listItem;

      return;
    }

    if (lexeme.typeLabel === "blockquoteEnd") {
      state.cursor = state.cursor.parent;

      return;
    }

    // not supported; text only
    if (lexeme.typeLabel === "html") {
      state.cursor.tokens.push({
        parent: state.cursor,
        typeLabel: "text",
        text: lexeme.text,
      });
      return;
    }

    if (lexeme.typeLabel === "code") {
      return;
      state.cursor.tokens.push({
        parent: state.cursor,
        typeLabel: "code",
        text: lexeme.text,
      });
      return;
    }

    if (lexeme.typeLabel === "hr") {
      state.cursor.tokens.push({
        parent: state.cursor,
        typeLabel: "hr",
      });

      return;
    }

    // list items
    if (lexeme.typeLabel === "looseItemStart") {
      const listItem = {
        typeLabel: "looseItem",
        parent: state.cursor,
        tokens: [],
      };

      state.cursor.tokens.push(listItem);
      state.cursor = listItem;

      return;
    }

    if (lexeme.typeLabel === "looseItemEnd") {
      state.cursor = state.cursor.parent;

      return;
    }

    throw new Error(`unhandled type ${lexeme.typeLabel}`);
  }

  *markdownBodyThings(tokens: Token[]) {
    const state: Partial<ParserState> = {
      wordCount: 0,
      typeLabel: "document",
      tokens: [],
      counts: {
        heading: 0,
        text: 0,
        blockQuote: 0,
        list: 0,
        listItem: 0,
      },
    };

    state.cursor = state;
    state.parent = state;

    // read everything in
    for (const token of tokens) {
      this.readLexeme(state as ParserState, {
        ...token,
        typeLabel: TokenType[token.type as any],
      });
    }

    const counts = state.counts!;
    const queue: any[] = [state];

    const fname = this.note.fname;
    const documentId = `${fname}/Document`;

    while (queue.length > 0) {
      let cursor = queue.pop();
      if (!cursor || cursor.typeLabel === "space") {
        continue;
      }

      if (cursor.typeLabel === "document") {
        yield {
          id: documentId,
          is: "Diatom/Document",
          wordCount: [[`${cursor.wordCount}`, "Word Count"]],
        };

        for (const token of cursor.tokens) {
          queue.push({
            documentId,
            parentId: documentId,
            ...token,
          });
        }

        continue;
      }

      if (cursor.typeLabel === "heading") {
        yield {
          id: `${cursor.parentId}/heading/${counts.heading++}`,
          is: "Diatom/Heading",
          "part-of": [cursor.parentId, cursor.documentId],
          depth: [
            [cursor.depth, "Diatom/HeadingDepth"],
          ],
          text: [
            [cursor.text, "Diatom/Heading"],
          ],
        };
        continue;
      }

      if (cursor.typeLabel === "text") {
        yield {
          id: `${cursor.parentId}/text/${counts.text++}`,
          is: "Diatom/Text",
          "part-of": [cursor.parentId, cursor.documentId],
          text: [
            [cursor.text, "Text"],
          ],
        };

        continue;
      }

      if (cursor.typeLabel === "blockquote") {
        const blockQuoteId = `${cursor.parentId}/blockQuote/${counts
          .blockQuote++}`;

        yield {
          id: blockQuoteId,
          is: "Diatom/BlockQuote",
          "part-of": cursor.parentId,
        };

        for (const token of cursor.tokens) {
          queue.push({
            documentId,
            parentId: blockQuoteId,
            ...token,
          });
        }

        continue;
      }

      if (cursor.typeLabel === "code") {
        continue;
      }

      if (cursor.typeLabel === "list") {
        const listId = `${cursor.parentId}/list/${counts.list++}`;

        yield {
          id: listId,
          is: "Diatom/List",
          "part-of": cursor.parentId,
        };

        for (const token of cursor.tokens) {
          queue.push({
            documentId,
            parentId: listId,
            ...token,
          });
        }

        continue;
      }

      if (cursor.typeLabel === "listItem") {
        const listItemId = `${cursor.parentId}/listItem/${counts.listItem++}`;

        yield {
          id: listItemId,
          is: "Diatom/ListItem",
          "part-of": cursor.parentId,
        };

        for (const token of cursor.tokens) {
          queue.push({
            documentId,
            parentId: listItemId,
            ...token,
          });
        }

        continue;
      }

      if (cursor.typeLabel === "hr") {
        continue;
      }
    }
  }

  *frontmatterThings(meta: Record<string, any>[]) {
    const addContext = (text: string): string => {
      const md = [
        ["$filename", this.note.fname],
        ["$filepath", this.note.fpath],
      ];

      for (const [src, tgt] of md) {
        text = text.toString().replace(src, tgt);
      }

      return text;
    };

    const tidy = (obj: any) => {
      for (const [key, val] of Object.entries(obj)) {
        let tidied = "";

        if (typeof val === "string") {
          tidied = addContext(val);
          obj[key] = tidied;
        } else if (Array.isArray(val)) {
          for (let bit of val) {
            if (typeof bit === "string") {
              bit = addContext(bit);
            }
            if (Array.isArray(bit)) {
              for (let inner of bit) {
                inner = addContext(inner);
              }
            }
          }
        }
      }

      return obj;
    };

    const file = {
      id: this.note.fpath,
      is: "Diatom/Note",
      references: [] as string[],
    };

    if (!meta) {
      meta = [];
    }

    if (!Array.isArray(meta)) {
      throw new Error(`diatom: ${this.note.fname} has malformed frontmatter`);
    }

    for (const thing of meta) {
      // make it easy to see your own data
      if (thing.is) {
        if (Array.isArray(thing.is)) {
          thing.is.push("Diatom/FrontmatterThing");
        } else {
          thing.is = [thing.is, "Diatom/FrontmatterThing"];
        }
      } else {
        thing.is = ["Diatom/FrontmatterThing"];
      }
      yield tidy(thing);

      for (const [rel, tgt] of Object.entries(tidy(thing) as any)) {
        addContext(rel);

        if (rel === "id") {
          file.references.push(tgt as string);
        }
      }
    }

    yield file;
  }

  async frontmatter(): Promise<Record<string, any>[]> {
    try {
      var lexeme = BlockLexer.lex(await this.note.read(false), {});
    } catch (err) {
      console.error(`diatom: failed to lex ${this.note.fpath}`);
      throw err;
    }

    return lexeme.meta as Record<string, any>[];
  }

  async body(): Promise<any> {
    try {
      var lexeme = BlockLexer.lex(await this.note.read(false), {});
    } catch (err) {
      console.error(`diatom: failed to lex ${this.note.fpath}`);
      throw err;
    }

    return lexeme.tokens;
  }

  /**
   * Enumerate things from the frontmatter and body of this document.
   *
   * @memberof NoteParser
   */
  async *things() {
    for (
      const thing of this.frontmatterThings(
        await this.frontmatter(),
      )
    ) {
      yield thing;
    }

    for (const thing of this.markdownBodyThings(await this.body())) {
      yield thing;
    }
  }
}
