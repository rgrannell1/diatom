import { BlockLexer } from "https://deno.land/x/markdown@v2.0.0/src/block-lexer.ts";
import {
  Token,
  TokenType,
} from "https://raw.githubusercontent.com/ubersl0th/markdown/master/src/interfaces.ts";

import * as Models from "./models.ts";

type Lexeme = Token & { typeLabel: string };

type ParserState = {
  cursor: any;
  parent: any;
  note: Record<string, any>;
  headings: { text: string; depth: number }[];
};

// +++ Read each markdown token +++

const readText = (state: ParserState, lexeme: Lexeme) => {
  return lexeme; // add custom hooks here
};

const readHeading = (state: ParserState, lexeme: Lexeme) => {
  state.headings.push({
    text: lexeme.text ?? "<missing header>",
    depth: lexeme.depth ?? 0,
  });

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
  note: Models.Note;

  constructor(note: Models.Note) {
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
      state.cursor.tokens.push(readHeading(state, lexeme));
      return;
    }

    if (lexeme.typeLabel === "text") {
      state.cursor.tokens.push(readText(state, lexeme));
      return;
    }

    if (lexeme.typeLabel === "listStart") {
      const list = {
        type: "list",
        parent: state.cursor,
        ordered: lexeme.ordered,
        tokens: [],
      };

      state.cursor.tokens.push(list);
      state.cursor = list;

      return;
    }

    if (lexeme.typeLabel === "listEnd") {
      console.log(state.cursor);
      state.cursor = state.cursor.parent;

      return;
    }

    // list items
    if (lexeme.typeLabel === "listItemStart") {
      const listItem = {
        type: "listItem",
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
        type: "blockquote",
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
        type: "text",
        text: lexeme.text,
      });
      return;
    }

    if (lexeme.typeLabel === "code") {
      state.cursor.tokens.push({
        parent: state.cursor,
        type: "code",
        text: lexeme.text,
      });
      return;
    }

    if (lexeme.typeLabel === "hr") {
      state.cursor.tokens.push({
        parent: state.cursor,
        type: "hr",
      });

      return;
    }

    // list items
    if (lexeme.typeLabel === "looseItemStart") {
      const listItem = {
        type: "looseItem",
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

  /**
   * Enumerate things from the frontmatter and body of this document.
   *
   * @memberof NoteParser
   */
  async *things() {
    const lexeme = BlockLexer.lex(await this.note.read(false), {});

    const state: Partial<ParserState> = {
      note: {
        tokens: [],
      },
      headings: [],
    };

    state.cursor = state.note;
    state.parent = state.note;

    for (const token of lexeme.tokens) {
      this.readLexeme(state as ParserState, {
        ...token,
        typeLabel: TokenType[token.type as any],
      });
    }

    console.log(state);
  }
}
