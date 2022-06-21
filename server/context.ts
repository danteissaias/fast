export interface HttpError {
  expose: boolean;
  init: ResponseInit;
  message: string;
}

export interface Context {
  request: Request;
  params: Record<string, string>;
  throw(
    status: number,
    message?: string,
    init?: ResponseInit,
  ): void;
  assert(
    expr: unknown,
    status: number,
    message?: string,
    init?: ResponseInit,
  ): asserts expr;
}

interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

export function createContext({
  request,
  params = {},
}: ContextInit): Context {
  const ctx = {
    request,
    params,
    throw: (
      status: number,
      message = "Internal Server Error",
      init: ResponseInit = { status },
    ) => {
      throw { init, message, expose: status < 500 };
    },
    assert: (
      expr: unknown,
      status: number,
      message?: string,
      init: ResponseInit = { status },
    ) => {
      if (expr) return;
      ctx.throw(status, message, init);
    },
  };

  return ctx;
}
