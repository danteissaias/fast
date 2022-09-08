export class ServerError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(status: number, message?: string, init: ResponseInit = {}) {
    super(message ?? "Internal Server Error");
    this.init = { status, ...init };
    this.expose = status < 500;
  }
}

export interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

export class Context {
  request: Request;
  params: Record<string, string>;

  constructor({ request, params }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
  }

  json = () =>
    this.request.json()
      .catch(() => this.throw(400, "Malformed request body."));

  throw(
    status = 500,
    message = "Internal Server Error",
    init: ResponseInit = {},
    // deno-fmt-ignore
  ) { throw new ServerError(status, message, init); }

  assert(
    expr: unknown,
    status = 500,
    message = "Assertion failed.",
    init: ResponseInit = {},
  ): asserts expr {
    if (expr) return;
    throw new ServerError(status, message, init);
  }
}
