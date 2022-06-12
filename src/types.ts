
export type Rewrite = {
  name: string;
  description: string;
  rewrite(content: string): string;
};

/*
 * Rewrite plugin interface; it returns
 * a list of rewrite functions
 *
 */
export interface IRewritePlugin {
  rules(): Rewrite[];
}
