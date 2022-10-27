import { WebApp } from "./web/app.ts";
export default () => new WebApp();
export { Context } from "./web/context.ts";
export type { Middleware, NextFunction } from "./web/next.ts";
