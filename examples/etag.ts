import fast, { middleware } from "../mod.ts";

const app = fast();
const etag = middleware.etag({ weak: true });
app.use(etag);

app.get("/", (_ctx) => {
  return "Hello, world";
});

await app.serve();
