import { Application } from "./application.ts";
import { Router } from "./router.ts";

const app = new Application();
const router = new Router();

app.use(router.routes());

router.get("/", () => "hello world");
router.post("/", () => "hello world");
router.get("/204", () => null);
router.get("/:val", (ctx) => ({ hello: ctx.params.val }));

await app.serve();
