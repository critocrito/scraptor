import test from "ava";
import server from "./helpers/server";
import {Do} from "../src";

test.before(async (t) => {
  await server(t);
});

test.after((t) => t.context.server.close());

test("browse to a page", async (t) => {
  const {port} = t.context;
  await Do(
    function* simpleTest({browse}) {
      const body = yield browse(`http://localhost:${port}/test.html`);
      t.is("<h1>Hello World!</h1>", body);
    },
    {headless: true},
  );
});
