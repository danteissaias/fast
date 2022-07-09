import { assertEquals } from "https://deno.land/std@0.146.0/testing/asserts.ts";
import fast from "./mod.ts";

const app = fast();

app.use(async (ctx, next) => {
  const res = await next(ctx);
  res.headers.set("x-text", "Hello, World!");
  return res;
});

app.get("/", () => "Hello, World!");
app.get("/_/:name", (ctx) => `Hello, ${ctx.params.name}!`);
app.get("/error", (ctx) => ctx.assert(false, 400, "Bad Request"));
app.get("/json", () => ({ text: "Hello, World!" }));

Deno.test("app.handle", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "Hello, World!");

  const req2 = new Request("http://localhost:8000/404");
  const res2 = await app.handle(req2);
  assertEquals(res2.status, 404);
  assertEquals(await res2.text(), "Not Found");

  const req3 = new Request("http://localhost:8000/_/Bob");
  const res3 = await app.handle(req3);
  assertEquals(res3.status, 200);
  assertEquals(await res3.text(), "Hello, Bob!");
});

Deno.test("decode", async () => {
  const req = new Request("http://localhost:8000/json");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { text: "Hello, World!" });
});

Deno.test("app.use", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "Hello, World!");
  assertEquals(res.headers.get("x-text"), "Hello, World!");
});

Deno.test("ctx.assert", async () => {
  const req = new Request("http://localhost:8000/error");
  const res = await app.handle(req);
  assertEquals(res.status, 400);
  assertEquals(await res.json(), { message: "Bad Request" });
});
