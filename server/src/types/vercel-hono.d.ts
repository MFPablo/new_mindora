declare module "@vercel/hono" {
  import type { Hono } from "hono";
  export function handle(app: Hono<any, any, any>): any;
}
