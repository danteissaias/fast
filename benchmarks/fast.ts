import fast from "../mod.ts";

const app = fast();

app.get("/", () => "Hello, World!");

app.listen();
