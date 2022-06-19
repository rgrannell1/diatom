export function eachMatch(pattern: RegExp) {
  const clonePattern = new RegExp(
    pattern.source,
    pattern.flags.includes("d") ? pattern.flags : `${pattern.flags}d`,
  );

  return new class {
    view(whole: string): string[] {
      let parts: string[] = [];

      for (const match of whole.matchAll(pattern)) {
        parts.push(match[0]);
      }

      return parts;
    }
    modify(fn: (part: string) => string) {
      return (whole: string) => {
        let parts: string[] = [];
        let start = 0;

        for (const match of whole.matchAll(clonePattern)) {
          const text = match[0];
          const boundaries = (match as any).indices[0];

          // push text from the previous match up to this match
          parts.push(whole.slice(start, boundaries[0]));

          // push transformed text
          parts.push(fn(text));

          start = boundaries[1];
        }

        // push the post-match remaining text
        parts.push(whole.slice(start, whole.length));

        return parts.join("");
      }
    }
  }();
}
