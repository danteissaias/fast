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
}: ContextInit): Context => ({
  request,
  params,
  assert(expr, status = 500, message = "Assertion failed.", init) {
    if (expr) return;
    throw new ServerError(status, message, init);
  },
});
