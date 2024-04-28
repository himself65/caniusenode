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
        <thead className="top-0 sticky bg-white">
          <tr>
            <th>API</th>
            <th>Node CJS</th>
            <th>Node ESM</th>
            <th>Deno</th>
            <th>Bun</th>
            <th>Cloudflare Worker</th>
          </tr>
        </thead>
        <tbody>
          {json.apis.map((row) => (
            <tr key={row.api}>
              <td>{row.api}</td>
              <td>{row.supportTable.nodeCJS === "Y" ? "✅" : "❌"}</td>
              <td>{row.supportTable.nodeESM === "Y" ? "✅" : "❌"}</td>
              <td>{row.supportTable.deno === "Y" ? "✅" : "❌"}</td>
              <td>{row.supportTable.bun === "Y" ? "✅" : "❌"}</td>
              <td>{row.supportTable.cloudflare === "Y" ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
