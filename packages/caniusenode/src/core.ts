import { spawnSync } from "node:child_process";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const fixtures = (file: string) => resolve(currentDir, "fixtures", file);

type Matrix = {
  target: string;
  type: string;
};

const getNodeVersion = () => {
  const cp = spawnSync("node", ["--version"]);
  return cp.stdout.toString().trim();
};

const getDenoVersion = () => {
  const cp = spawnSync("deno", ["--version"]);
  return cp.stdout.toString().trim();
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
    deno: boolean;
    bun: boolean;
    nodeCJS: boolean;
    nodeESM: boolean;
  };
};

type Annotation = {
  api: string;
};

const table = new Map<string, TableItem>();

export async function benchmark(filePath: string, annotation: Annotation) {
  const results = await Promise.all(
    matrix.map<MatrixResult>((matrix) => {
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
          bun: false,
          deno: false,
          nodeCJS: false,
          nodeESM: false,
        },
      };
      table.set(annotation.api, item);
    }
    if (target === "deno" && type === "module") {
      item.supportTable.deno = result.success;
    }
    if (target === "node" && type === "commonjs") {
      item.supportTable.nodeCJS = result.success;
    }
    if (target === "node" && type === "module") {
      item.supportTable.nodeESM = result.success;
    }
    if (target === "bun") {
      item.supportTable.bun = result.success;
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
        bun: false,
        deno: false,
        nodeCJS: false,
        nodeESM: false,
      },
    };
    table.set(item.name, tableItem);
  }
  tableItem.supportTable = {
    bun: item.bun,
    deno: item.deno,
    nodeCJS: item.nodeCJS,
    nodeESM: item.nodeESM,
  };
}

const nodeVersion = getNodeVersion();
const denoVersion = getDenoVersion();
const bunVersion = getBunVersion();

export { currentDir, table, nodeVersion, denoVersion, bunVersion };
