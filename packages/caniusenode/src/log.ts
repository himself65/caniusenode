import { table } from "./core";

console.table(
  [...table.values()].map((item) => ({
    api: item.api,
    "node cjs": item.supportTable.nodeCJS ? "✅" : "❌",
    "node esm": item.supportTable.nodeESM ? "✅" : "❌",
    deno: item.supportTable.deno ? "✅" : "❌",
    bun: item.supportTable.bun ? "✅" : "❌",
  })),
);
