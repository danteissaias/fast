import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { Application } from "./application.ts";

const app = new Application();
app.get("/", () => "Hello, World!");

Deno.test("app.handle", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req).then((res) => res.text());
  assertEquals(res, "Hello, World!");
});
