import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import fast, { Middleware } from "../mod.ts";

const mware: Middleware = async (ctx, next) => {
  const res = await next(ctx);
  res.headers.set("X-Middleware", "1");
  return res;
};

Deno.test("app.#add", () => {
  const app = fast();
  app.get("/", () => "Hello, World!");
  app.post("/", () => "Hello, World!");
  app.put("/", () => "Hello, World!");
  app.patch("/", () => "Hello, World!");
  app.head("/", () => "Hello, World!");
  app.options("/", () => "Hello, World!");
  app.delete("/", () => "Hello, World!");
});

Deno.test("app.use", () => {
  const app = fast();
  app.use(() => "Hello, World!");
});

Deno.test("app.#match", async () => {
  const app = fast();
  app.get("/", () => "Hello, World!");
  app.get("/about", () => "Another page!");
  const req1 = new Request("http://localhost/");
  const req2 = new Request("http://localhost/about");
  const req3 = new Request("http://localhost/404");
  const res1 = await app.handle(req1).then((r) => r.text());
  const res2 = await app.handle(req2).then((r) => r.text());
  const res3 = await app.handle(req3);
  const { error: { status, message } } = await res3.json();
  assertEquals(res1, "Hello, World!");
  assertEquals(res2, "Another page!");
  assertEquals(status, 404);
  assertEquals(message, "Not found");
});

Deno.test("app.handle", async () => {
  const app = fast();
  app.use(mware);
  app.get("/", () => "Hello, World!");
  const req = new Request("http://localhost/");
  const res = await app.handle(req);
  const txt = await res.text();
  const hdr = res.headers.get("X-Middleware");
  assertEquals(txt, "Hello, World!");
  assertEquals(hdr, "1");
});
