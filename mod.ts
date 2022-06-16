/**
 * Minimalist web framework for Deno.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.143.0/http/server.ts";
 * import { Application } from "https://deno.land/x/fast/mod.ts";
 *
 * const app = new Application();
 *
 * app.get("/", () => new Response("Hello, World!"));
 *
 * await serve(app.handle);
 * ```
 *
 * @module
 */
export { Application } from "./application.ts";
export { Context, HttpError, type Middleware } from "./context.ts";
export { Router } from "./router.ts";
