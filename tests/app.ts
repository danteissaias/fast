import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import { Application } from "../application.ts";

Deno.test("application", async () => {
  const app = new Application();
  app.use(() => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(await res.text(), "Hello, World!");
});

Deno.test("ctx.next()", async () => {
  const app = new Application();
  app.use((ctx) => ctx.next());
  app.use(() => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(await res.text(), "Hello, World!");
});

Deno.test("router", async () => {
  const app = new Application();
  app.get("/hello", () => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/hello");
  const res = await app.handle(req);
  assertEquals(await res.text(), "Hello, World!");
});

Deno.test("pattern matching", async () => {
  const app = new Application();
  app.get("/:name", (ctx) => new Response(`name: ${ctx.params.name}`));
  const req = new Request("http://localhost:8000/test");
  const res = await app.handle(req);
  assertEquals(await res.text(), "name: test");
});

Deno.test("405 handler", async () => {
  const app = new Application();
  app.post("/", () => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(res.status, 405);
  assertEquals(await res.text(), "Method Not Allowed");
});
