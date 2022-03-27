import { BlockLexer } from "https://deno.land/x/markdown@v2.0.0/src/block-lexer.ts";
import {
  Token,
  TokenType,
} from "https://raw.githubusercontent.com/ubersl0th/markdown/master/src/interfaces.ts";

import * as Models from "./models.ts";

type ParserState = {
  cursor: any;
  note: Record<string, any>;
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

  }

  async *things() {
    const lexeme = BlockLexer.lex(await this.note.read(false), {});

    const state: Partial<ParserState> = {
      note: {},
    };

    state.cursor = state.note;

    for (const token of lexeme.tokens) {
      this.readLexeme(state as ParserState, {
        ...token,
        typeLabel: TokenType[token.type as any],
      });
    }
  }
}
