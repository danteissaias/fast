import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import { Application } from "../application.ts";

Deno.test("application", async () => {
  const app = new Application();
  app.get("/", () => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(await res.text(), "Hello, World!");
});

Deno.test("method not allowed", async () => {
  const app = new Application();
  app.post("/", () => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(res.status, 405);
  assertEquals(await res.json(), { message: "Method Not Allowed" });
});
