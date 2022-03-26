import * as Config from "./config.ts";
import { renderFile } from "https://deno.land/x/mustache/mod.ts";


/**
 * Render a template
 *
 * @export
 * @param {Record<string, string>} model
 * @return {*}
 */
export async function file(model: Record<string, string>) {
  const config = await Config.read();

  return renderFile(config.template, model);
}
