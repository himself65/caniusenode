import json from "./fixtures/all.json" assert { type: "json" };
import {
  runBun,
  runCloudflare,
  runDeno,
  runNodeCJS,
  runNodeESM,
} from "./utils";
import { type ResultTable, Status } from "./type";

const globalObjects = json.miscs.find(
  (misc) => misc.name === "Global objects",
)!;

const globalsResultTable: ResultTable = [];

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
        nodeCJS: Status.Unknown,
        nodeESM: Status.Unknown,
        deno: Status.Unknown,
        bun: Status.Unknown,
        cloudflare: Status.Unknown,
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
      item.nodeCJS = value ? Status.Support : Status.NotSupport;
    });
  }

  {
    // node esm
    const { stdout } = await runNodeESM(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.nodeESM = value ? Status.Support : Status.NotSupport;
    });
  }

  {
    // deno
    const { stdout } = runDeno(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.deno = value ? Status.Support : Status.NotSupport;
    });
  }

  {
    // bun
    const { stdout } = await runBun(runTestCode);
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.bun = value ? Status.Support : Status.NotSupport;
    });
  }

  {
    // cloudflare
    const stdout = await runCloudflare(`
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    ${runTestCode}
    const result = runTest();
    return new Response(result);
  },
};
`);
    if (!stdout) {
      throw new Error("Failed to run cloudflare worker");
    }
    const result: Result = JSON.parse(stdout.toString().trim());
    Object.entries(result).forEach(([name, value]) => {
      const item = globalsResultTable.find((item) => item.name === name)!;
      item.cloudflare = value ? Status.Support : Status.NotSupport;
    });
  }
}

export { globalsResultTable };
