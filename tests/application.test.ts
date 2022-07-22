import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { Application } from "../mod.ts";

const app = new Application();
app.get("/", () => "Hello, World!");
app.get("/msg/:id", (ctx) => `Hello, ${ctx.params.id}!`);
app.post("/", () => "Hello, World!");

Deno.test("app.handle", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req).then((res) => res.text());
  assertEquals(res, "Hello, World!");

  const req2 = new Request("http://localhost:8000", { method: "POST" });
  const res2 = await app.handle(req2).then((res) => res.text());
  assertEquals(res2, "Hello, World!");

  const req3 = new Request("http://localhost:8000/404", { method: "POST" });
  const res3 = await app.handle(req3).then((res) => res.json());
  assertEquals(res3, { message: "Not Found" });

  const req4 = new Request("http://localhost:8000/msg/123");
  const res4 = await app.handle(req4).then((res) => res.text());
  assertEquals(res4, "Hello, 123!");
});
