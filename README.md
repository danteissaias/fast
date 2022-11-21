# Fast

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)
[![codecov](https://codecov.io/gh/danteissaias/fast/branch/main/graph/badge.svg?token=LTiVBNmwP7)](https://codecov.io/gh/danteissaias/fast)

```ts
import fast from "https://deno.land/x/fast/mod.ts";

const app = fast();

app.get("/", () => "Hello, World!");

await app.serve();
```
