/*
 * Focus one subpart of a dataset
 *
 */
export abstract class Lens<Whole, Part> {
  abstract view(whole: Whole): Part;
  abstract set(part: Part, whole: Whole): Whole;

  /*
   * Apply a function to a part of the data
   */
  modify(whole: Whole, fn: (part: Part) => Part): Whole {
    return this.set(fn(this.view(whole)), whole);
  }

  /*
   * Compose two lenses; get and set subparts of a dateset
   */
  compose<SubPart>(lens1: Lens<Part, SubPart>) {
    const self = this;

    return new class {
      view(whole: Whole): SubPart | undefined {
        return lens1.view(self.view(whole));
      }
    }();
  }
}
