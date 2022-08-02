import type { Context, NextFunction } from "../mod.ts";

export type StaticOrigin =
  | boolean
  | string
  | RegExp
  | (boolean | string | RegExp)[];

export type OriginFn = (
  origin: string | undefined,
  request: Request,
) => StaticOrigin | Promise<StaticOrigin>;

/**
 * An Object will all possible options that can be passed to `cors`.
 * The default options are:
 *
 * ```ts
 * {
 *  origin: '*',
 *  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
 *  preflightContinue: false,
 *  optionsSuccessStatus: 204,
 * }
 * ```
 *
 * {@link https://github.com/danteissaias/fast#cors-configurations}
 */

export interface CorsOptions {
  /**
   * The value to match against the `Access-Control-Allow-Origin`
   * header in the requestuest. Defaults to `'*'`.
   *
   * It can be a boolean, string, a regular expression, an array of those, or
   * a function that returns one of those.
   *
   * If set to `'*'` all origins will be allowed.
   *
   * If set to `true` then `Access-Control-Allow-Origin` will
   * reflect the origin of the requestuest.
   *
   * If set to `false` then all origins will be denied (`Access-Control-Allow-Origin`
   * will not be set).
   *
   * If set to a regular expression then the requestuest origin will be matched
   * against it.
   *
   * If set to a function, it will receive the requestuest origin string as the first
   * parameter and the requestuest as the second parameter. It can return a promise.
   */
  origin?: StaticOrigin | OriginFn;
  /**
   * Customizes the `Access-Control-Allow-Methods` header.
   *
   * It can be a string or an array of strings. Defaults to `'GET,HEAD,PUT,PATCH,POST,DELETE'`.
   */
  methods?: string | string[];
  /**
   * Configures the `Access-Control-Allow-Headers` header.
   *
   * It can be a string or an array of strings.
   * There's no default value (the header is omitted).
   */
  allowedHeaders?: string | string[];
  /**
   * Configures the `Access-Control-Expose-Headers` header.
   *
   * It can be a string or an array of strings.
   * There's no default value (the header is omitted).
   */
  exposedHeaders?: string | string[];
  /**
   * Configures the `Access-Control-Allow-Credentials` header.
   *
   * It can be a boolean. But the header is only set if it is `true`.
   * There's no default value (the header is omitted).
   */
  credentials?: boolean;
  /**
   * Configures the `Access-Control-Max-Age` header.
   *
   * Its value has to be an integer.
   * There's no default value (the header is omitted).
   */
  maxAge?: number;
}

export const cors = (options?: CorsOptions) => {
  return async (ctx: Context, next: NextFunction) => {
    const { request } = ctx;
    const response = await next(ctx);
    const { headers } = response;

    const defaultOptions: CorsOptions = {
      origin: "*",
      methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    };

    function isOriginAllowed(origin: string, allowed: StaticOrigin): boolean {
      return Array.isArray(allowed)
        ? allowed.some((o) => isOriginAllowed(origin, o))
        : typeof allowed === "string"
        ? origin === allowed
        : allowed instanceof RegExp
        ? allowed.test(origin)
        : !!allowed;
    }

    function getOriginHeaders(
      requestOrigin: string | undefined,
      origin: StaticOrigin,
    ) {
      const headers = new Headers();

      if (origin === "*") {
        // Allow any origin
        headers.set("Access-Control-Allow-Origin", "*");
      } else if (typeof origin === "string") {
        // Fixed origin
        headers.set("Access-Control-Allow-Origin", origin);
        headers.append("Vary", "Origin");
      } else {
        const allowed = isOriginAllowed(requestOrigin ?? "", origin);

        if (allowed && requestOrigin) {
          headers.set("Access-Control-Allow-Origin", requestOrigin);
        }
        headers.append("Vary", "Origin");
      }

      return headers;
    }

    async function originHeadersFromRequest(
      request: Request,
      origin: StaticOrigin | OriginFn,
    ) {
      const requestOrigin = request.headers.get("Origin") || undefined;

      const value = typeof origin === "function"
        ? await origin(requestOrigin, request)
        : origin;

      if (!value) return;

      return getOriginHeaders(requestOrigin, value);
    }

    const mergeHeaders = (value: string, key: string) => {
      if (key === "vary") headers.append(key, value);
      else headers.set(key, value);
    };

    const opts = { ...defaultOptions, ...options };

    const originHeaders = await originHeadersFromRequest(
      request,
      opts.origin ?? false,
    );

    if (!originHeaders) return response;

    originHeaders.forEach(mergeHeaders);

    if (opts.credentials) {
      headers.set("Access-Control-Allow-Credentials", "true");
    }

    const exposed = Array.isArray(opts.exposedHeaders)
      ? opts.exposedHeaders.join(",")
      : opts.exposedHeaders;

    if (exposed) {
      headers.set("Access-Control-Expose-Headers", exposed);
    }

    // Handle the preflight request
    if (request.method === "OPTIONS") {
      if (opts.methods) {
        const methods = Array.isArray(opts.methods)
          ? opts.methods.join(",")
          : opts.methods;

        headers.set("Access-Control-Allow-Methods", methods);
      }

      if (typeof opts.maxAge === "number") {
        headers.set("Access-Control-Max-Age", String(opts.maxAge));
      }

      headers.set("Content-Length", "0");
    }

    return response;
  };
};
