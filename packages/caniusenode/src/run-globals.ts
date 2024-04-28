import json from "./fixtures/all.json" assert { type: "json" };
import { spawnSync } from "node:child_process";
import { writeFile, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const globalObjects = json.miscs.find(
  (misc) => misc.name === "Global objects",
)!;

async function runNodeCJS(code: string) {
  const dir = await mkdtemp(join(tmpdir(), "nodejs-"));
  const file = join(dir, "node-test.cjs");
  await writeFile(file, code);
  return spawnSync("node", [file]);
}

async function runNodeESM(code: string) {
  const dir = await mkdtemp(join(tmpdir(), "nodejs-"));
  const file = join(dir, "node-test.mjs");
  await writeFile(file, code);
  return spawnSync("node", [file]);
}

function runDeno(code: string) {
  return spawnSync("deno", ["eval", code]);
}

async function runBun(code: string) {
  // note that bun doesn't have eval command, we need to create a temporary file
  const dir = await mkdtemp(join(tmpdir(), "bun-"));
  const file = join(dir, "bun-test.js");
  await writeFile(file, code);
  return spawnSync("bun", [file]);
}

type GlobalsResultTable = {
  name: string;
  nodeESM: boolean;
  nodeCJS: boolean;
  deno: boolean;
  bun: boolean;
}[];
const globalsResultTable: GlobalsResultTable = [];

for (const section of ["globals", "classes", "miscs", "methods"] as const) {
  const items = globalObjects[section]!;

  const runTestCode = `
function runTest() {
  const result = {}
${items
  .map((g) => {
    let name = g.name;
    // unwrap \`...\`
    if (name.startsWith("class_")) name = g.textRaw.slice(6).trim();
    if (name.startsWith("`") && name.endsWith("`")) name = name.slice(1, -1);
    if (globalsResultTable.findIndex((item) => item.name === name) === -1) {
      // init
      globalsResultTable.push({
        name,
        nodeCJS: false,
        nodeESM: false,
        deno: false,
        bun: false,
      });
    }
    return `  result['${name}'] = typeof ${name} !== "undefined"`;
  })
  .join("\n")}
  return JSON.stringify(result)
}
console.log(runTest())`;
  type Result = {
    [name: string]: boolean;
  };

  {
    // node cjs
    const { stdout } = await runNodeCJS(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.nodeCJS = value;
    });
  }

  {
    // node esm
    const { stdout } = await runNodeESM(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.nodeESM = value;
    });
  }

  {
    // deno
    const { stdout } = runDeno(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.deno = value;
    });
  }

  {
    // bun
    const { stdout } = await runBun(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.bun = value;
    });
  }
}

export { globalsResultTable };
