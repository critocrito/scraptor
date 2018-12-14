// export * from "./browser";
import {ofP} from "dashp";
import {curry2, curry3} from "@critocrito/curry";
import puppeteer from "puppeteer";

const browse = curry2("browse", async (url, page) => {
  await page.goto(url);
});

const screenshot = curry2("screenshot", async (target, page) => {
  await page.screenshot({path: target, fullPage: true});
});

const input = curry3("input", async (selector, value, page) => {
  /* istanbul ignore next */
  await page.$eval(
    selector,
    (el, val) => {
      el.value = ""; // eslint-disable-line no-param-reassign
      el.value = val; // eslint-disable-line no-param-reassign
      el.setAttribute("value", val);
    },
    value,
  );
});

const api = {
  browse,
  screenshot,
  input,
};

export const Do = async (G, {headless} = {headless: true}) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disabled-setuid-sandbox"],
    headless,
  });
  const page = await browser.newPage();
  const generator = G(api);
  let data = "";

  const chain = async (nextG) => {
    const {done, value} = await nextG.next(data.replace("\n", "").trim());
    if (done) {
      await browser.close();
      return Promise.resolve();
    }
    await value(page);
    /* istanbul ignore next */
    data = await page.$eval("body", (elem) => elem.innerHTML);

    return chain(nextG);
  };

  return ofP(chain(generator));
};
