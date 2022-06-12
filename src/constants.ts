import { join } from "https://deno.land/std@0.127.0/path/mod.ts";

export const HOME = Deno.env.get("HOME") ?? "/";
export const CONFIG_PATH = join(HOME, ".config/diatom.yaml");
export const DEFAULT_EDITOR = 'nano';
export const EDITOR_ENV_VARIABLE = 'EDITOR';
