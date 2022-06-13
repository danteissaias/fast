import { Context } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

const fallback = () => new Response("Not Found", { status: 404 });

export class Application {
  #middlewares: Middleware[] = [fallback];

  use(...middlewares: Middleware[]) {
    this.#middlewares.splice(-1, 0, ...middlewares);
    return this;
  }

  handle = async (request: Request) => {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return await next(ctx);
  };
}
