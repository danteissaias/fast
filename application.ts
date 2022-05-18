import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { Context, convert } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

interface ListenInit {
  port: number;
  hostname: string;
}

export class Application {
  #middlewares: Middleware[] = [];

  use(...middlewares: Middleware[]) {
    this.#middlewares.push(...middlewares);
    return this;
  }

  handle(request: Request) {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return next(ctx).catch(convert);
  }

  async listen(opts: Partial<ListenInit> = {}) {
    if (!this.#middlewares.length) throw new Error("no middleware");
    const fallback: Middleware = (ctx) => ctx.throw(404, "Not Found");
    this.#middlewares.push(fallback);
    const { hostname = "0.0.0.0", port = 8000 } = opts;
    await serve((r) => this.handle(r), { hostname, port });
  }
}
