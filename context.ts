import type { ErrorInit } from "./types.ts";
import { ServerError } from "./types.ts";

export interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

const badRequest = {
  status: 400,
  message: "Invalid request: malformed request body.",
};

export class Context {
  request: Request;
  params: Record<string, string>;
  status = 200;

  constructor({ request, params }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
  }

  get body() {
    return this.request.json()
      .catch(() => this.throw(badRequest));
  }

  throw(
    error: ErrorInit,
    // deno-fmt-ignore
  ) { throw new ServerError(error); }

  assert(
    expr: unknown,
    error: ErrorInit,
  ): asserts expr {
    if (expr) return;
    throw new ServerError(error);
  }
}
