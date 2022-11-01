import type { Context } from "./context.ts";

export type Middleware = (
  ctx: Context,
) => Promise<unknown> | unknown;

export interface ErrorInit {
  status: number;
  code: string;
  message: string;
}

export class ServerError extends Error {
  status: number;
  code: string;
  constructor(error: ErrorInit) {
    super(error.message);
    this.code = error.code;
    this.status = error.status;
  }
}
