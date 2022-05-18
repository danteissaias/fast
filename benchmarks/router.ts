import { Application, Router } from "../mod.ts";

const app = new Application();
const router = new Router();

router.get("/", () => "hello world");
app.use(router.routes());

await app.listen();
