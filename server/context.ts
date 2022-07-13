export class ServerError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(status: number, message?: string, init: ResponseInit = {}) {
    super(message ?? "Internal Server Error");
    this.init = { status, ...init };
    this.expose = status < 500;
  }
}

export type CtxAssertFn = (
  expr: unknown,
  status?: number,
  message?: string,
  init?: ResponseInit,
) => asserts expr;

export const assert: CtxAssertFn = (
  expr,
  status = 500,
  message = "Assertion failed",
  init,
) => {
  if (expr) return;
  throw new ServerError(status, message, init);
};

export class State {
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
  #url?: URL;
  state = new State();
  assert: CtxAssertFn;

  // deno-fmt-ignore
  get url() { return this.#url ?? (this.#url = new URL(this.request.url)) }

  redirect(pathname: string, status = 302) {
    const { href } = new URL(pathname, this.request.url);
    const headers = { location: href };
    return new Response(null, { status, headers });
  }

  constructor({ request, params }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
    this.assert = assert;
  }
}
