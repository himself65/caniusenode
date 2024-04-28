import waitPort from "wait-port";
import getPort from "get-port";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as console from "node:console";

export const currentDir = fileURLToPath(new URL(".", import.meta.url));
export const fixtures = (file: string) => resolve(currentDir, "fixtures", file);

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

export async function runCloudflare(code: string) {
  const file = resolve(currentDir, "..", "cloudflare", "src", "index.ts");
  try {
    const port = await getPort();
    await writeFile(file, code);
    const cp = spawn("pnpm", ["dlx", "wrangler", "dev", "--port", `${port}`], {
      cwd: resolve(currentDir, "..", "cloudflare"),
    });
    cp.stderr.on("data", (data) => {
      console.error(data.toString());
      if (data.toString().includes("ERR_RUNTIME_FAILURE")) {
        cp.kill();
      }
    });
    await waitPort({
      port,
      output: "silent",
      timeout: 2000,
    });
    return fetch(`http://localhost:${port}/`)
      .then((res) => res.text())
      .then((text) => {
        cp?.kill();
        return text;
      })
      .catch(() => {
        cp?.kill();
        return null;
      });
  } catch (e) {
  } finally {
    await rm(file);
  }
}
