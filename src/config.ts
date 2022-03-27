import * as Constants from "./constants.ts";
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";

export type Config = any;

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

  return content as Config;
}
