import fast, { middleware } from "../mod.ts";

const opts = {
  origin: "*",
  allowedHeaders: ["Content-Type", "Charset"],
  methods: ["GET, HEAD, OPTIONS"],
  credentials: true,
  exposedHeaders: ["Content-Type"],
  maxAge: 86400,
};

const app = fast();

const cors = middleware.cors(opts);
app.use(cors);

app.get("/", (_ctx) => {
  return "Hello, world";
});

app.options("/", (_ctx) => {
  return "Hello, world";
});

await app.serve();
