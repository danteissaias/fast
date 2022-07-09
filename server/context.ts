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

export const createContext = ({
  request,
  params = {},
}: ContextInit): Context => {
  let url: URL;
  return {
    request,
    params,
    // deno-fmt-ignore
    get url() { return url ?? (url = new URL(request.url)) },
    assert(expr, status = 500, message = "Assertion failed.", init) {
      if (expr) return;
      throw new ServerError(status, message, init);
    },
  };
};
