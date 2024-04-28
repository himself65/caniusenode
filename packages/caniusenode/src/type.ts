export const enum Status {
  Support = "Y",
  NotSupport = "N",
  Unknown = "?",
  PartiallySupport = "P",
}

export type ResultTable = {
  name: string;
  nodeESM: Status;
  nodeCJS: Status;
  deno: Status;
  bun: Status;
  cloudflare: Status;
}[];
