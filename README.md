# Fast

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)

Fast middleware framework for Deno.

### Example server

A minimal server using the router middleware.

```ts
import { Application, Router } from "https://deno.land/x/fast/mod.ts";

const router = new Router();
router.get("/", (ctx) => "Hello, World!");

const app = new Application();
app.use(router);
app.serve({ port: 8080 });
```
