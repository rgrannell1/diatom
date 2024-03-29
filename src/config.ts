import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";
import * as Constants from "./constants.ts";
import { bold, cyan, gray } from "https://deno.land/std/fmt/colors.ts";

/*
 * Editor configuration
 */
export type Editor = {
  name: string;
  default: string;
  open_note: string[];
  open_config: string[];
  open_folder: string[];
};

/*
 * The config file follows this format
 */
export type Config = {
  vault: string;
  templates: Record<string, string>;
  editors: Editor[];
};

/**
 * Read configuration from XDG configuration home
 *
 * @export
 * @return {*}  {Promise<Config>}
 */
export async function read(): Promise<Config> {
  const configExists = await exists(Constants.CONFIG_PATH);

  if (!configExists) {
    const message = `${cyan("diatom")}: ${gray('config file ' + Constants.CONFIG_PATH + ' missing.')}`;
    console.error(message);
    Deno.exit(1);
  }

  return yamlParse(
    await Deno.readTextFile(Constants.CONFIG_PATH),
  ) as Config;
}


/* Get the configured editor, or fallback to default otherwise.
 *
 */
export const getEditor = (config: Config, name?: string): Editor => {
  const fallback = Deno.env.get(Constants.EDITOR_ENV_VARIABLE) ??
    Constants.DEFAULT_EDITOR;

  return config.editors.find((editor: Editor) => {
    if (editor.name) {
      return editor.name === name;
    } else {
      new Set(["yes", "true"]).has(editor.default.toLowerCase());
    }
  }) ?? {
    name: fallback,
    default: "yes",
    open_note: [fallback, "$fpath"],
    open_folder: [fallback, "$fpath"],
    open_config: [fallback, "$fpath"],
  };
};
