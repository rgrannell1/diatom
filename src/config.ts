import * as Constants from "./constants.ts";
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";

export type Editor = {
  name: string,
  default: string,
  open_note: string[],
  open_config: string[],
  open_folder: string[],
}

export type Config = {
  vault: string,
  templates: Record<string, string>,
  editors: Editor[]
};

/**
 * Read configuration from XDG configuration home
 *
 * @export
 * @return {*}  {Promise<Config>}
 */
export async function read(): Promise<Config> {
  return yamlParse(
    await Deno.readTextFile(Constants.CONFIG_PATH),
  ) as Config;
}

export const getEditor = (config: Config): Editor => {
  const fallback = Deno.env.get('VISUAL') ?? 'nano'

  return config.editors.find((editor: Editor) => {
    return new Set(['yes', 'true']).has(editor.default.toLowerCase())
  }) ?? {
    name: fallback,
    default: 'yes',
    open_note: [fallback, '$fpath'],
    open_folder: [fallback, '$fpath'],
    open_config: [fallback, '$fpath'],
  }
}
