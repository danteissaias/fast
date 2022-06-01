/**
 * Fast middleware framework for Deno.
 *
 * ### Example server
 *
 * A minimal server using the router middleware.
 *
 * ```ts
 * import { Application, Router } from "https://deno.land/x/fast/mod.ts";
 *
 * const router = new Router();
 * router.get("/", (ctx) => "Hello, World!");
 *
 * const app = new Application();
 * app.use(router);
 * app.serve({ port: 8080 });
 * ```
 *
 * @module
 */
export { Application } from "./application.ts";
export { Context, HttpError } from "./context.ts";
export type {
  Middleware,
  MiddlewareResponse,
  NextFunction,
} from "./middleware.ts";
export { Router } from "./router.ts";
