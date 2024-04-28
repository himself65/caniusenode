import { spawnSync } from "node:child_process";
import { extname } from "node:path";
import { fixtures, runCloudflare } from "./utils";
import { Status } from "./type";
import { readFile } from "node:fs/promises";

type Matrix = {
  target: string;
  type: string;
};

const getNodeVersion = () => {
  const cp = spawnSync("node", ["--version"]);
  const version = cp.stdout.toString().trim();
  return version.slice(1);
};

const getDenoVersion = () => {
  const cp = spawnSync("deno", ["--version"]);
  const version = cp.stdout.toString().split("\n")[0]!.trim();
  // deno 1.xx.x (release, aarch64-apple-darwin)
  return version.split(" ")[1];
};

const getBunVersion = () => {
  const cp = spawnSync("bun", ["--version"]);
  return cp.stdout.toString().trim();
};

const matrix = [
  {
    target: "node",
    type: "commonjs",
  },
  {
    target: "node",
    type: "module",
  },
  {
    target: "deno",
    type: "module",
  },
  {
    target: "bun",
    type: "commonjs",
  },
  {
    target: "cloudflare",
    type: "module",
  },
];

type MatrixResult =
  | {
      matrix: Matrix;
      success: true;
    }
  | {
      matrix: Matrix;
      success: false;
      skipped: false;
      error: string;
    }
  | {
      matrix: Matrix;
      success: false;
      skipped: true;
    };

type TableItem = {
  api: string;
  supportTable: {
    deno: Status;
    bun: Status;
    nodeCJS: Status;
    nodeESM: Status;
    cloudflare: Status;
  };
};

type Annotation = {
  api: string;
};

const table = new Map<string, TableItem>();

export async function benchmark(filePath: string, annotation: Annotation) {
  const results = await Promise.all(
    matrix.map<Promise<MatrixResult>>(async (matrix) => {
      const { target, type } = matrix;
      if (type === "commonjs" && extname(filePath) === ".mjs") {
        return {
          matrix,
          success: false,
          skipped: true,
        };
      }
      if (type === "module" && extname(filePath) === ".cjs") {
        return {
          matrix,
          success: false,
          skipped: true,
        };
      }
      if (target === "cloudflare" && type !== "module") {
        return {
          matrix,
          success: false,
          skipped: true,
        };
      }
      if (target === "cloudflare") {
        const content = await readFile(filePath, "utf-8");
        const result = await runCloudflare(`
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    ${content}
    return new Response('SUCCESS');
  },
};`);
        if (result === "SUCCESS") {
          return {
            matrix,
            success: true,
          };
        } else {
          return {
            matrix,
            success: false,
            error: result ?? "Unknown error",
            skipped: false,
          };
        }
      }
      const cp = spawnSync(target, [filePath]);
      if (cp.status !== 0) {
        return {
          matrix,
          success: false,
          skipped: false,
          error: cp.stderr.toString(),
        };
      } else {
        return {
          matrix,
          success: true,
        };
      }
    }),
  );
  for (const result of results) {
    if (!result.success && result.skipped) {
      continue;
    }
    const { matrix } = result;
    const { target, type } = matrix;
    let item = table.get(annotation.api);
    if (!item) {
      item = {
        api: annotation.api,
        supportTable: {
          bun: Status.Unknown,
          deno: Status.Unknown,
          nodeCJS: Status.Unknown,
          nodeESM: Status.Unknown,
          cloudflare: Status.Unknown,
        },
      };
      table.set(annotation.api, item);
    }
    if (target === "deno" && type === "module") {
      item.supportTable.deno = result.success
        ? Status.Support
        : Status.NotSupport;
    }
    if (target === "node" && type === "commonjs") {
      item.supportTable.nodeCJS = result.success
        ? Status.Support
        : Status.NotSupport;
    }
    if (target === "node" && type === "module") {
      item.supportTable.nodeESM = result.success
        ? Status.Support
        : Status.NotSupport;
    }
    if (target === "bun") {
      item.supportTable.bun = result.success
        ? Status.Support
        : Status.NotSupport;
    }
  }
}

await Promise.all([
  benchmark(fixtures("./module/require.cjs"), {
    api: "require",
  }),
  benchmark(fixtures("./module/require.mjs"), {
    api: "require",
  }),
]);
const { globalsResultTable } = await import("./run-globals");

for (const item of globalsResultTable) {
  let tableItem = table.get(item.name);
  if (!tableItem) {
    tableItem = {
      api: item.name,
      supportTable: {
        bun: Status.Unknown,
        deno: Status.Unknown,
        nodeCJS: Status.Unknown,
        nodeESM: Status.Unknown,
        cloudflare: Status.Unknown,
      },
    };
    table.set(item.name, tableItem);
  }
  tableItem.supportTable = {
    bun: item.bun,
    deno: item.deno,
    nodeCJS: item.nodeCJS,
    nodeESM: item.nodeESM,
    cloudflare: item.cloudflare,
  };
}

const { modulesResultTable } = await import("./run-modules");

for (const item of modulesResultTable) {
  let tableItem = table.get(item.name);
  if (!tableItem) {
    tableItem = {
      api: `module "${item.name}"`,
      supportTable: {
        bun: Status.Unknown,
        deno: Status.Unknown,
        nodeCJS: Status.Unknown,
        nodeESM: Status.Unknown,
        cloudflare: Status.Unknown,
      },
    };
    table.set(item.name, tableItem);
  }
  tableItem.supportTable = {
    bun: item.bun,
    deno: item.deno,
    nodeCJS: item.nodeCJS,
    nodeESM: item.nodeESM,
    cloudflare: item.cloudflare,
  };
}

const nodeVersion = getNodeVersion();
const denoVersion = getDenoVersion();
const bunVersion = getBunVersion();

export { table, nodeVersion, denoVersion, bunVersion };
