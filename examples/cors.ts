import fast from "../mod.ts";
import { cors } from "../middleware/mod.ts";

const app = fast();

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Charset"],
    methods: ["GET, HEAD, OPTIONS"],
    credentials: true,
    exposedHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);

app.get("/", (_ctx) => {
  return "Hello, world";
});

app.options("/", (_ctx) => {
  return "Hello, world";
});

await app.serve();
