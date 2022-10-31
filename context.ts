import decode from "./decode.ts";
import type { ErrorInit, Middleware } from "./types.ts";
import { ServerError } from "./types.ts";

export interface ContextInit {
  request: Request;
  middlewares: Middleware[];
  params?: Record<string, string>;
}

const BadRequest = {
  code: "badRequest",
  message: "Malformed request body.",
};

export class Context {
  request: Request;
  params: Record<string, string>;
  #middlewares: Middleware[];
  #cur = -1;

  constructor({ request, params, middlewares }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
    this.#middlewares = middlewares;
  }

  async next() {
    try {
      const cur = ++this.#cur;
      const res = await this.#middlewares[cur](this);
      return decode(res);
    } catch (error) {
      const {
        status = 500,
        code = "unknownErr",
        message = "An unknown error occurred.",
      } = error;
      const init = { status };
      const body = { error: { code, message } };
      return Response.json(body, init);
    }
  }

  get body() {
    return this.request.json()
      .catch(() => this.throw(400, BadRequest));
  }

  throw(
    status: number,
    error: ErrorInit,
    // deno-fmt-ignore
  ) { throw new ServerError(status, error); }

  assert(
    expr: unknown,
    status: number,
    error: ErrorInit,
  ): asserts expr {
    if (expr) return;
    throw new ServerError(status, error);
  }
}
