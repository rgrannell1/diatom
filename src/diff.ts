/*
 * Display a file diff side-by-side, with colour
 */
export class Diff {
  static async isInstalled() {
  }
  static async diff(older: string, newer: string) {
    const olderFpath = await Deno.makeTempFile();
    const newerFpath = await Deno.makeTempFile();

    await Promise.all([
      Deno.writeTextFile(olderFpath, older),
      Deno.writeTextFile(newerFpath, newer),
    ]);

    console.clear();
    const proc = Deno.run({
      cmd: [
        "icdiff",
        "--line-numbers",
        olderFpath,
        newerFpath,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    await proc.status();

    // just assume this always works for noew
    const rawOutput = await proc.output();
    await Deno.stdout.write(rawOutput);
  }
}
