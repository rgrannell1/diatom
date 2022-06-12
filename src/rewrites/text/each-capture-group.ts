/*
 * Enumerate each capture group
 *
 */
export function eachFirstCaptureGroup<string, string>(pattern: RegExp) {
  return new class {
    view(whole: string): string[] {
    }
    set(value: string, whole: string) {
      return this.modify(whole, (part) => value);
    }
    modify(whole: string, fn: (part: string) => string) {
    }
  }();
}
