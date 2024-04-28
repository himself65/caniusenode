import json from "caniusenode/benchmark.json" assert { type: "json" };

type TableItemProps = {
  value: string;
};
const TableItem = ({ value }: TableItemProps) => {
  return (
    <td className="text-center">
      {value === "Y"
        ? "✅"
        : value === "N"
          ? "❌"
          : value === "?"
            ? "❔"
            : "🟡"}
    </td>
  );
};

export function FullTable() {
  return (
    <>
      <div>
        <div>versions</div>
        <div>node: {json.versions.node}</div>
        <div>deno: {json.versions.deno}</div>
        <div>bun: {json.versions.bun}</div>
        <div>Cloudflare Worker: {json.versions.cloudflare}</div>
      </div>
      <table className="border-separate [border-spacing:0.75rem]">
        <caption className="text-center text-lg font-bold p-2">
          API Compatibility table
        </caption>
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
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
              <TableItem value={row.supportTable.nodeCJS} />
              <TableItem value={row.supportTable.nodeESM} />
              <TableItem value={row.supportTable.deno} />
              <TableItem value={row.supportTable.bun} />
              <TableItem value={row.supportTable.cloudflare} />
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
