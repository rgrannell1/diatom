import { Prism } from "../optics/prism.ts";

export function firstMatch(pattern: RegExp): Prism<string, string> {
  return new class extends Prism<string, string> {
    view(whole: string) {
      const matches = whole.match(pattern);

      return matches === null || matches.length === 0 ? undefined : matches[0];
    }
    set(part: string, whole: string) {
      const matches = whole.match(pattern);

      if (
        matches === null || matches.length === 0 || matches?.index === undefined
      ) {
        return whole;
      }

      const idx = matches.index;
      return whole.slice(0, idx) +
        part +
        whole.slice(idx + matches[0].length, whole.length);
    }
  }();
}
