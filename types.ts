import type { Context } from "./context.ts";

export type Middleware = (
  ctx: Context,
) => Promise<unknown> | unknown;

export type ErrorInit = {
  status: number;
  message: string;
} & Record<string, string | number>;

export class ServerError extends Error {
  status: number;
  init: ErrorInit;
  expose = true;
  constructor({ message, status, ...rest }: ErrorInit) {
    super(message);
    this.status = status;
    this.init = { message, status, ...rest };
  }
}
