import { Prism } from "../optics/prism.ts";

export function firstCaptureGroup(pattern: RegExp): Prism<string, string> {
  const clonePattern = new RegExp(
    pattern.source,
    pattern.flags.includes("d") ? pattern.flags : `${pattern.flags}d`,
  );

  return new class extends Prism<string, string> {
    view(whole: string) {
      const matches = whole.match(clonePattern);

      return matches === null || matches.length === 0 ? undefined : matches[1];
    }
    set(part: string, whole: string) {
      const matches: any = clonePattern.exec(whole);
      if (matches === null) {
        return whole;
      }

      if (!matches.indices || matches.indices.length < 1) {
        return whole;
      }

      const [captureStart] = (matches as any).indices[1];

      return whole.slice(0, captureStart) +
        part +
        whole.slice(captureStart + matches[1].length, whole.length);
    }
  }();
}
