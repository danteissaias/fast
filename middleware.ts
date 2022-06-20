import { Context } from "./context.ts";

export type MiddlewareResponse =
  | string
  | void
  | null
  | unknown
  | undefined
  | Response;

export type Middleware = (
  ctx: Context,
) => MiddlewareResponse | Promise<MiddlewareResponse>;
