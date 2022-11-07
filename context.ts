import decode from "./decode.ts";
import type { ErrorInit, Middleware } from "./types.ts";
import { ServerError } from "./types.ts";

export interface ContextInit {
  request: Request;
  middlewares: Middleware[];
  params?: Record<string, string>;
}

const badRequest = {
  status: 400,
  message: "Malformed request body.",
};

export class Context {
  request: Request;
  params: Record<string, string>;
  #middlewares: Middleware[];
  #cur = -1;
  status = 200;

  constructor({ request, params, middlewares }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
    this.#middlewares = middlewares;
  }

  async next() {
    try {
      const cur = ++this.#cur;
      const res = await this.#middlewares[cur](this);
      return decode(res, this.status);
    } catch (error) {
      const def = "An unknown error occured";
      let { status = 500, message = def, expose = false } = error;
      if (!expose) message = def;
      const body = { error: { status, message } };
      return Response.json(body, { status });
    }
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
