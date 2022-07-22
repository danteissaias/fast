export class ServerError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(status: number, message?: string, init: ResponseInit = {}) {
    super(message ?? "Internal Server Error");
    this.init = { status, ...init };
    this.expose = status < 500;
  }
}

class State {
  // deno-lint-ignore no-explicit-any
  #state: Record<string, any> = {};
  get = <T>(key: string): T | null => this.#state[key] ?? null;
  set = <T>(key: string, value: T) => this.#state[key] = value;
}

export interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

export class Context {
  request: Request;
  params: Record<string, string>;
  state: State;
  #url: URL | undefined;
  query: Record<string, string>;

  constructor({ request, params }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
    this.state = new State();
    this.query = Object.fromEntries((this.url).searchParams.entries());
  }

  get url() {
    if (!this.#url) this.#url = new URL(this.request.url);
    return this.#url;
  }

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

  redirect(pathname: string, status = 302) {
    const to = new URL(pathname, this.request.url);
    return Response.redirect(to, status);
  }
}
