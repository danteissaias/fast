import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { Context } from "./context.ts";
import { compose, decode } from "./middleware.ts";

const request = new Request("http://localhost:8000");
const params = {};
const ctx = new Context({ request, params });

Deno.test("compose", async () => {
  const fn = compose([() => "Hello, World!"]);
  const res = await fn(ctx).then((res) => res.text());
  assertEquals(res, "Hello, World!");
});

Deno.test("decode", async () => {
  const ret = "Hello, World!";
  const res = await decode(ret).text();
  assertEquals(res, "Hello, World!");
});
