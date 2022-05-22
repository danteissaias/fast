import { Application } from "../mod.ts";

const app = new Application();

app.use(() => "hello world");

await app.serve();
