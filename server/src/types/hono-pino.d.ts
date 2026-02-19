declare module "hono-pino" {
  import { MiddlewareHandler } from "hono";
  import { Logger } from "pino";

  export interface PinoLoggerOptions {
    pino?: Logger;
    http?: {
      reqId?: () => string;
    };
  }

  export function pinoLogger(options?: PinoLoggerOptions): MiddlewareHandler;
}
