import test from "ava";
import {JSDOM} from "jsdom";
import server from "./helpers/server";
import {Do} from "../src";

test.before(async (t) => {
  await server(t);
});

test.after((t) => t.context.server.close());

test("browse to a page", async (t) => {
  const {port} = t.context;
  await Do(function* simpleTest({browse}) {
    const body = yield browse(`http://localhost:${port}/test.html`);
    const {window} = new JSDOM(body);
    t.is("Hello World!", window.document.querySelector("h1").textContent);
  });
});

test("fill text into an input field", async (t) => {
  const {port} = t.context;
  await Do(function* formInput({browse, input}) {
    yield browse(`http://localhost:${port}/forms.html`);
    const body = yield input("#input-field > input", "Hey You!");
    const {window} = new JSDOM(body);
    t.is(
      "Hey You!",
      window.document.querySelector("#input-field > input").value,
    );
  });
});