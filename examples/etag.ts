import fast from "../mod.ts";
import { etag } from "../middleware/etag.ts";

const app = fast();

app.use(
  etag({
    weak: true,
  }),
);

app.get("/", (_ctx) => {
  return "Hello, world";
});

await app.serve();
