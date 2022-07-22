import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { compose, Context, decode } from "../mod.ts";

const request = new Request("http://localhost:8000");
const params = {};
const ctx = new Context({ request, params });

Deno.test("compose", async () => {
  const fn = compose([() => "Hello, World!"]);
  const res = await fn(ctx).then((res) => res.text());
  assertEquals(res, "Hello, World!");
});

Deno.test("decode", async () => {
  const a = "Hello, World!";
  const res = await decode(a).text();
  assertEquals(res, a);

  const b = { abc: 123 };
  const res2 = await decode(b).json();
  assertEquals(res2, b);

  const fn = () => decode(compose);
  assertThrows(fn, "decode(): bad response");
});
