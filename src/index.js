// export * from "./browser";
import {curry} from "lodash/fp";
import {ofP} from "dashp";
import puppeteer from "puppeteer";

const browse = curry(async (url, page) => {
  await page.goto(url);
});

const screenshot = curry(async (target, page) => {
  await page.screenshot({path: target, fullPage: true});
});

const api = {
  browse,
  screenshot,
};

export const Do = async (G, {headless}) => {
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
    const handle = await page.$("body");
    /* istanbul ignore next */
    data = await page.evaluate((elem) => elem.innerHTML, handle);
    await handle.dispose();

    return chain(nextG);
  };

  return ofP(chain(generator));
};
