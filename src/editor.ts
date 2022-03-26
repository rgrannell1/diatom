import { Config } from "./config.ts";

/**
 * Open a file in a chosen editor
 *
 * @export
 * @param {Config} config
 * @param {string} fpath
 */
export async function open(config: Config, fpath: string) {
  const proc = Deno.run({
    cmd: [config.visualEditor, "--goto", `${fpath}:${config.cursorStart}`],
  });

  await proc.status();
}
