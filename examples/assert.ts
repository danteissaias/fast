import fast, { type Context } from "https://deno.land/x/fast@5.0.0/mod.ts";

const app = fast();

const missingEmail = {
  status: 400,
  code: "parameterMissing",
  message: `Missing required param: email.`,
};

const missingPassword = {
  status: 400,
  code: "parameterMissing",
  message: `Missing required param: password.`,
};

// We must explicitly type the `ctx` paramter.
// https://github.com/microsoft/TypeScript/issues/36931
app.post("/login", async (ctx: Context) => {
  const { email, password } = await ctx.body;
  ctx.assert(email, missingEmail);
  ctx.assert(password, missingPassword);
  // ...
  return { token: 123 };
});

await app.serve();
