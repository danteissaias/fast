import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.149.0/testing/asserts.ts";
import fast, { middleware } from "../mod.ts";

const app = fast();

const etag = middleware.etag({ weak: true });
app.use(etag);

app.get("/", (_ctx) => {
  return "Hello, world";
});

Deno.test("etag-middleware", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);

  assertExists(res.headers.get("etag"));
  assertEquals(
    res.headers.get("etag"),
    'W/"2be88ca4242c76e8253ac62474851065032d6833"',
  );
});
