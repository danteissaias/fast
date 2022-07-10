export class ServerError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(status: number, message?: string, init: ResponseInit = {}) {
    super(message ?? "Internal Server Error");
    this.init = { status, ...init };
    this.expose = status < 500;
  }
}

export interface Context {
  request: Request;
  params: Record<string, string>;
  url: URL;
  state: State;
  assert: (
    expr: unknown,
    status?: number,
    message?: string,
    init?: ResponseInit,
  ) => asserts expr;
}

export interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

class State {
  // deno-lint-ignore no-explicit-any
  #state: Record<string, any> = {};
  get = <T>(key: string): T | null => this.#state[key] ?? null;
  set = <T>(key: string, value: T) => this.#state[key] = value;
}

export const createContext = ({
  request,
  params = {},
}: ContextInit): Context => {
  let url: URL;
  const state = new State();
  return {
    request,
    params,
    state,
    // deno-fmt-ignore
    get url() { return url ?? (url = new URL(request.url)) },
    assert(expr, status = 500, message = "Assertion failed.", init) {
      if (expr) return;
      throw new ServerError(status, message, init);
    },
  };
};
