import { runCloudflare } from "./utils";

const result = await runCloudflare(`
import 'node:child_process';
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response('Hello World!');
  },
};`);

console.log(result);
