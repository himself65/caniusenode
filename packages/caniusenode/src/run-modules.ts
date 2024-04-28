import { runBun, runDeno, runNodeCJS, runNodeESM } from "./utils";
import * as console from "node:console";

const nodeModules = [
  "node:assert",
  "node:async_hooks",
  "node:buffer",
  "node:child_process",
  "node:cluster",
  "node:console",
  "node:constants",
  "node:crypto",
  "node:dgram",
  "node:diagnostics_channel",
  "node:dns",
  "node:domain",
  "node:events",
  "node:fs",
  "node:http",
  "node:http2",
  "node:https",
  "node:inspector",
  "node:module",
  "node:net",
  "node:os",
  "node:path",
  "node:perf_hooks",
  "node:process",
  "node:punycode",
  "node:querystring",
  "node:readline",
  "node:repl",
  // "node:sea",
  "node:stream",
  "node:string_decoder",
  "node:sys",
  "node:test",
  "node:timers",
  "node:tls",
  "node:trace_events",
  "node:tty",
  "node:url",
  "node:util",
  "node:v8",
  "node:vm",
  "node:wasi",
  "node:worker_threads",
  "node:zlib",
] as const;

type ModulesResultTable = {
  name: string;
  nodeESM: boolean;
  nodeCJS: boolean;
  deno: boolean;
  bun: boolean;
}[];
const modulesResultTable: ModulesResultTable = [
  ...nodeModules.map((name) => ({
    name,
    nodeESM: false,
    nodeCJS: false,
    deno: false,
    bun: false,
  })),
];

const generateImportCode = (moduleName: string) => `import "${moduleName}";\n`;
const generateRequireCode = (moduleName: string) =>
  `require("${moduleName}");\n`;

{
  // node cjs
  for (const moduleName of nodeModules) {
    const result = await runNodeCJS(generateRequireCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.nodeCJS = !notSupported;
  }
}

{
  // node esm
  for (const moduleName of nodeModules) {
    const result = await runNodeESM(generateImportCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.nodeESM = !notSupported;
  }
}

{
  // deno
  for (const moduleName of nodeModules) {
    const result = runDeno(generateImportCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.deno = !notSupported;
  }
}

{
  // bun
  for (const moduleName of nodeModules) {
    const result = await runBun(generateRequireCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.bun = !notSupported;
  }
}

export { modulesResultTable };
