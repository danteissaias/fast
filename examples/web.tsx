/** @jsxImportSource https://esm.sh/react@18.2.0 */
import fast, { middleware } from "../mod.ts";

const app = fast();

const cwd = Deno.cwd();
const fs = middleware.serve(cwd);
app.get("/assets/", fs);

app.get("/", () => (
  <html lang="en" hidden>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script type="module" src="https://cdn.skypack.dev/twind/shim" />
    </head>
    <body>
      <h1 className="text-red-500">Hello World</h1>
      <p>This is an example application.</p>
    </body>
  </html>
));

app.serve();
