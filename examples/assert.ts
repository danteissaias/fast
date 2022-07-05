import fast, { type Context } from "../mod.ts";

const app = fast();

app.post("/login", async (ctx: Context) => {
  const { email, password } = await ctx.request.json();
  ctx.assert(email, 400, "Missing email");
  ctx.assert(password, 400, "Missing password");
  // Do login...
  return { token: "1234" };
});

await app.serve();
