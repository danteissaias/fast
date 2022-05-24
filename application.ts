import {
  ServeInit,
  Server,
} from "https://deno.land/std@0.140.0/http/server.ts";
import { Context, HttpError } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

const fallback: Middleware = (ctx) => ctx.throw("Not Found", { status: 404 });

export class Application {
  #middlewares = [fallback];

  use(...middlewares: Middleware[]) {
    this.#middlewares.splice(-1, 0, ...middlewares);
    return this;
  }

  async handle(request: Request) {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return await next(ctx);
  }

  async serve(opts: ServeInit = {}) {
    if (!this.#middlewares.length) throw new Error("No middleware");
    const port = opts.port ?? 8000;
    const hostname = opts.hostname ?? "0.0.0.0";
    const handler = this.handle.bind(this);
    const onError = opts.onError ??
      ((error) => {
        console.log(error);
        const { message, init } = error instanceof HttpError
          ? error
          : { message: "Internal Server Error", init: { status: 500 } };
        return Response.json({ message }, init);
      });
    const server = new Server({ port, hostname, handler, onError });
    const s = server.listenAndServe();
    if (opts.onListen) opts.onListen({ port, hostname });
    console.log(`http://${hostname}:${port}/ 🚀`);
    return await s;
  }
}
