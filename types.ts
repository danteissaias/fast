import type { Context } from "./context.ts";

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Promise<unknown> | unknown;

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

export class ServerError extends Error {
  status: number;
  constructor(status = 500, message: string) {
    super(message);
    this.status = status;
  }
}
