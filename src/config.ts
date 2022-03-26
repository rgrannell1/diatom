import * as Constants from "./constants.ts";
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";

export type Config = {
  vault: string;
  editor: string;
  visualEditor: string;
  template: string;
  cursorStart: string;
};

/**
 * Read configuration from XDG configuration home
 *
 * @export
 * @return {*}  {Promise<Config>}
 */
export async function read(): Promise<Config> {
  const content = yamlParse(
    await Deno.readTextFile(Constants.CONFIG_PATH),
  ) as Record<string, string>;

  content.editor = "micro";
  content.visualEditor = "code";

  return content as Config;
}
