import * as Config from "./config.ts";
import { renderFile } from "https://deno.land/x/mustache/mod.ts";

/**
 * Render a note template using a provided model
 *
 * @export
 * @param {Record<string, string>} model
 * @return {*}
 */
export async function file(model: Record<string, string>) {
  const config = await Config.read();

  return renderFile(config.templates.note, model);
}
