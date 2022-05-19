import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { Context, convert } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

interface ListenInit {
  port: number;
  hostname: string;
}

const fallback: Middleware = (ctx) => ctx.throw(404, "Not Found");

export class Application {
  #middlewares: Middleware[] = [fallback];

  use(...middlewares: Middleware[]) {
    // Insert new middlewares before fallback:
    // - Faster than concatting fallback in handle()
    // - We want to keep handle() standalone so can't push fallback in listen()
    this.#middlewares.splice(-1, 0, ...middlewares);
    return this;
  }

  async handle(request: Request) {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return await next(ctx).catch(convert);
  }

  async listen(opts: Partial<ListenInit> = {}) {
    if (!this.#middlewares.length) throw new Error("no middleware");
    const { hostname = "0.0.0.0", port = 8000 } = opts;
    await serve((r) => this.handle(r), { hostname, port });
  }
}
