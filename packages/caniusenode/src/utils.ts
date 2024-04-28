import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

export async function runNodeCJS(code: string) {
  const dir = await mkdtemp(join(tmpdir(), "nodejs-"));
  const file = join(dir, "node-test.cjs");
  await writeFile(file, code);
  return spawnSync("node", [file]);
}

export async function runNodeESM(code: string) {
  const dir = await mkdtemp(join(tmpdir(), "nodejs-"));
  const file = join(dir, "node-test.mjs");
  await writeFile(file, code);
  return spawnSync("node", [file]);
}

export function runDeno(code: string) {
  return spawnSync("deno", ["eval", code]);
}

export async function runBun(code: string) {
  // note that bun doesn't have eval command, we need to create a temporary file
  const dir = await mkdtemp(join(tmpdir(), "bun-"));
  const file = join(dir, "bun-test.js");
  await writeFile(file, code);
  return spawnSync("bun", [file]);
}
