import { assertEquals } from "https://deno.land/std@0.146.0/testing/asserts.ts";
import { Application } from "./mod.ts";

const app = new Application();

app.use(async (_, next) => {
  const res = await next();
  res.headers.set("x-hello", "world");
  return res;
});

app.get("/", () => "Hello, World!");
app.get("/json", () => ({ hello: "world" }));
app.get("/error", (ctx) => ctx.assert(false, 400, "Bad Request"));

Deno.test("app.handle", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "Hello, World!");

  const req2 = new Request("http://localhost:8000/404");
  const res2 = await app.handle(req2);
  assertEquals(res2.status, 404);
  assertEquals(await res2.text(), "Not Found");

  const req3 = new Request("http://localhost:8000/json");
  const res3 = await app.handle(req3);
  assertEquals(res3.status, 200);
  assertEquals(await res3.json(), { hello: "world" });
});

Deno.test("app.use", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "Hello, World!");
  assertEquals(res.headers.get("x-hello"), "world");
});

Deno.test("ctx.assert", async () => {
  const req = new Request("http://localhost:8000/error");
  const res = await app.handle(req);
  assertEquals(res.status, 400);
  assertEquals(await res.json(), { message: "Bad Request" });
});
