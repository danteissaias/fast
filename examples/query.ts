import fast from "../mod.ts";

const app = fast();

app.get("/", (ctx) => {
  const name = ctx.query["name"];
  if (name) return `Hello, ${name}`;
  return "Hello, world";
});

await app.serve();
