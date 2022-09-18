import fast, { type Context } from "https://deno.land/x/fast/mod.ts";

const app = fast();

// We must explicitly type the `ctx` paramter.
// https://github.com/microsoft/TypeScript/issues/36931
app.post("/login", async (ctx: Context) => {
  const { email, password } = await ctx.request.json();
  ctx.assert(email, 400, "Missing email.");
  ctx.assert(password, 400, "Missing email.");
  // ...
  return { token: 123 };
});

await app.serve();
