import { sha1 } from "../utils/crypto.ts";
import { Context, NextFunction } from "../mod.ts";

type ETagOptions = {
  weak: boolean;
};

export const etag = (options: ETagOptions = { weak: false }) => {
  return async (ctx: Context, next: NextFunction) => {
    const ifNoneMatch = ctx.request.headers.get("If-None-Match") ||
      ctx.request.headers.get("if-none-match");

    const response = await next(ctx);

    const body = ctx.request.body!;
    const hash = await sha1(body);

    const etag = options.weak ? `W/"${hash}"` : `"${hash}"`;

    if (ifNoneMatch && ifNoneMatch === etag) {
      response.headers.delete("Content-Length");

      return new Response(null, {
        status: 304,
        statusText: "Not Modified",
      });
    } else {
      response.headers.append("ETag", etag);

      const clone = response.clone();

      return new Response(clone.body, clone);
    }
  };
};
