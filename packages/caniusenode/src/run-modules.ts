import {
  runBun,
  runCloudflare,
  runDeno,
  runNodeCJS,
  runNodeESM,
} from "./utils";
import * as console from "node:console";
import { type ResultTable, Status } from "./type";

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

const modulesResultTable: ResultTable = [
  ...nodeModules.map((name) => ({
    name,
    nodeESM: Status.Unknown,
    nodeCJS: Status.Unknown,
    deno: Status.Unknown,
    bun: Status.Unknown,
    cloudflare: Status.Unknown,
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
    item.nodeCJS = notSupported ? Status.NotSupport : Status.Support;
  }
}

{
  // node esm
  for (const moduleName of nodeModules) {
    const result = await runNodeESM(generateImportCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.nodeESM = notSupported ? Status.NotSupport : Status.Support;
  }
}

{
  // deno
  for (const moduleName of nodeModules) {
    const result = runDeno(generateImportCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.deno = notSupported ? Status.NotSupport : Status.Support;
  }
}

{
  // bun
  for (const moduleName of nodeModules) {
    const result = await runBun(generateRequireCode(moduleName));
    const notSupported = result.status !== 0;
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    item.bun = notSupported ? Status.NotSupport : Status.Support;
  }
}

{
  // cloudflare worker
  for (const moduleName of nodeModules) {
    console.log("running cloudflare worker", moduleName);
    const result = await runCloudflare(`
import "${moduleName}";
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response('SUCCESS');
  },
};`);
    const item = modulesResultTable.find((item) => item.name === moduleName)!;
    if (result === "SUCCESS") {
      item.cloudflare = Status.Support;
    } else {
      item.cloudflare = Status.NotSupport;
    }
  }
}

export { modulesResultTable };
