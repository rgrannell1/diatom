/*
 * Prism are lenses with Option<Part> output. Here I just use undefined instead
 *
 * - View a part of some data (returning undefined if it doesn't exist)
 * - Override a part of some data with some value, if it exists
 *
 */
export abstract class Prism<Whole, Part> {
  abstract view(whole: Whole): Part | undefined;
  abstract set(part: Part, whole: Whole): Whole;

  /*
   *
   * Apply a function to a part of the data, if that data is defined
   */
  modify(fn: (part: Part) => Part) {
    return (whole: Whole): Whole => {
      const part = this.view(whole);

      if (typeof part === "undefined") {
        return whole;
      }

      return this.set(fn(part), whole);
    }
  }

  /*
   *
   * Compose two prisms; get and set subparts of a dateset
   */
  compose<SubPart>(prism1: Prism<Part, SubPart>) {
    const self = this;

    return new class {
      view(whole: Whole): SubPart | undefined {
        const part0 = self.view(whole);

        if (typeof part0 === "undefined") {
          return undefined;
        }

        return prism1.view(part0);
      }
    }();
  }
}
