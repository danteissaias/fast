/**
 * Minimalist web framework for Deno.
 *
 * ```ts
 * import { serve } from "https://deno.land/std/http/server.ts";
 * import { Application } from "https://deno.land/x/fast/mod.ts";
 *
 * const app = new Application();
 *
 * app.get("/", () => new "Hello, World!");
 *
 * await serve(app.handle);
 * ```
 *
 * @module
 */
export { Application } from "./application.ts";
export { Context, HttpError } from "./context.ts";
export type { Middleware, MiddlewareResponse } from "./middleware.ts";
export { Router } from "./router.ts";
