import { Config } from "./config.ts";

/**
 * Open a file in a chosen editor
 *
 * @export
 * @param {Config} config
 * @param {string} fpath
 */
export async function openNote(config: Config, fpath: string) {
  const proc = Deno.run({
    cmd: ['code', "--goto", `${fpath}:8:7`],
  });

  await proc.status();
}

export async function openVault(config: Config) {
  const proc = Deno.run({
    cmd: ['code', '-n', config.vault],
  });

  await proc.status();
}
