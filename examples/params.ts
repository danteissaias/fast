import fast from "https://deno.land/x/fast@5.0.0/mod.ts";

const app = fast();

app.get("/:page", (ctx) => {
  const { page } = ctx.params;
  // ...
  return "<p>Hello, World</p>";
});

await app.serve();
