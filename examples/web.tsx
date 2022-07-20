/** @jsxImportSource https://esm.sh/preact@10.9.0 */
import fast from "../mod.ts";

const app = fast();

app.get("/", () => <h1>Hello World</h1>);

await app.serve();
