import fast from "https://deno.land/x/fast/mod.ts";

const app = fast();

app.get("/:page", (ctx) => {
  const { page } = ctx.params;
  // ...
  return "<p>Hello, World</p>";
});

await app.serve();
