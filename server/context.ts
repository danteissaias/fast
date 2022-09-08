export class ServerError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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

  throw(
    status: number,
    message: string,
    // deno-fmt-ignore
  ) { throw new ServerError(status, message); }

  assert(
    expr: unknown,
    status: number,
    message: string,
  ): asserts expr {
    if (expr) return;
    throw new ServerError(status, message);
  }
}
