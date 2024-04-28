import json from "caniusenode/benchmark.json" assert { type: "json" };

type TableItemProps = {
  value: string;
};
const TableItem = ({ value }: TableItemProps) => {
  return (
    <td className="text-center w-36 border border-gray-300">
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
        <div>Cloudflare Workers: {json.versions.cloudflare}</div>
      </div>
      <table className="border border-gray-300">
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
        <thead className="top-0 sticky bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">API</th>
            <th className="border border-gray-300">
              <div className="flex items-center justify-center">
                <img
                  src="/images/node.svg"
                  alt="Node CJS"
                  width={20}
                  height={20}
                  className="mr-1"
                />
                Node CJS
              </div>
            </th>
            <th className="border border-gray-300">
              <div className="flex items-center justify-center">
                <img
                  src="/images/node.svg"
                  alt="Node ESM"
                  width={20}
                  height={20}
                  className="mr-1"
                />
                Node ESM
              </div>
            </th>
            <th className="border border-gray-300">
              <div className="flex items-center justify-center">
                <img
                  src="/images/deno.svg"
                  alt="Deno"
                  width={20}
                  height={20}
                  className="mr-1"
                />
                Deno
              </div>
            </th>
            <th className="border border-gray-300">
              <div className="flex items-center justify-center">
                <img
                  src="/images/bun.svg"
                  alt="Bun"
                  width={20}
                  height={20}
                  className="mr-1"
                />
                Bun
              </div>
            </th>
            <th className="border border-gray-300">
              <div className="flex items-center justify-center">
                <img
                  src="/images/cloudflare-workers.svg"
                  alt="Cloudflare Workers"
                  width={20}
                  height={20}
                  className="mr-1"
                />
                Cloudflare Workers
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {json.apis.map((row) => (
            <tr key={row.api}>
              <td className="p-2 border border-gray-300">{row.api}</td>
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
