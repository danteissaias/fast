import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.149.0/testing/asserts.ts";
import React from "https://esm.sh/react@18.2.0";
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

  const c = null;
  const res3 = decode(c);
  assertEquals(res3.status, 204);

  const d = new Blob(["Hello World!"]);
  const res4 = await decode(d)
    .blob()
    .then((res) => res.text());
  assertEquals(res4, await d.text());

  const e = [1, 2, 3];
  const res5 = await decode(e).json();
  assertEquals(res5, [1, 2, 3]);

  const f = React.createElement("h1", { children: "Hello, World!" });
  const res6 = await decode(f).text();
  assertEquals(res6, "<h1>Hello, World!</h1>");
});
