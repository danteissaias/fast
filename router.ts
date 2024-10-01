import { WebApp } from "./app.ts";
import { Handler } from "./types.ts";

export class Router extends WebApp {
  routes: Map<string, Handler>;

  constructor() {
    super();
    this.routes = new Map();

    // deno-fmt-ignore-line
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
    for (const method of methods) {
      this[method] = (path, handler) =>
        this.#add(path, method.toUpperCase(), handler);
    }
  }

  #add(pathname: string, method: string, handler: Handler) {
    const id = method + ',' + pathname;
    this.routes.set(id, handler);

    return this;
  }
}
