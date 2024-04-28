import { table, nodeVersion, bunVersion, denoVersion } from "./core";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { currentDir } from "./utils";

const content = JSON.stringify(
  {
    versions: {
      node: nodeVersion,
      deno: denoVersion,
      bun: bunVersion,
    },
    apis: [...table.values()],
  },
  null,
  2,
);

await writeFile(join(currentDir, "../benchmark.json"), content);
