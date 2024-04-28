import json from "caniusenode/benchmark.json" assert { type: "json" };

export function FullTable() {
  return (
    <>
      <div>
        <div>versions</div>
        <div>node: {json.versions.node}</div>
        <div>deno: {json.versions.deno}</div>
        <div>bun: {json.versions.bun}</div>
      </div>
      <table>
        <caption>API Compatibility table</caption>
        <thead>
          <tr>
            <th>API</th>
            <th>Node CJS</th>
            <th>Node ESM</th>
            <th>Deno</th>
            <th>Bun</th>
          </tr>
        </thead>
        <tbody>
          {json.apis.map((row) => (
            <tr key={row.api}>
              <td>{row.api}</td>
              <td>{row.supportTable.nodeCJS ? "✅" : "❌"}</td>
              <td>{row.supportTable.nodeESM ? "✅" : "❌"}</td>
              <td>{row.supportTable.deno ? "✅" : "❌"}</td>
              <td>{row.supportTable.bun ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
