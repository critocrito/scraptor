import {ofP, collectP} from "dashp";
import puppeteer from "puppeteer";

const waitUntilLoaded = (opts = {}) => (page) =>
  page.waitForNavigation(Object.assign({waitUntil: "load"}, opts));

const browse = (url) => (page) => page.goto(url);

const waitUntil = (cond, opts = {timeout: 30000}) => (page) =>
  page.waitFor(cond, opts);

const screenshot = (target) => async (page) => {
  await page.screenshot({path: target, fullPage: true});
};

const input = (selector, value) => (page) =>
  page.$eval(
    selector,
    /* istanbul ignore next */
    (el, val) => {
      el.value = ""; // eslint-disable-line no-param-reassign
      el.value = val; // eslint-disable-line no-param-reassign
      el.setAttribute("value", val);
    },
    value,
  );

const scroll = (selector, opts) => async (page) => {
  const {times, timeout} = Object.assign({times: 1, timeout: 1000}, opts);
  const scroller = async () => {
    await page.$eval(
      selector,
      /* istanbul ignore next */
      (el) => {
        el.scrollBy(0, window.innerHeight);
      },
    );
    await page.waitFor(timeout);
  };
  const range = [...Array(times).keys()];
  await collectP(scroller, range);
};

const api = {
  browse,
  waitUntil,
  waitUntilLoaded,
  screenshot,
  input,
  scroll,
};

export const Do = async (G, {headless} = {headless: true}) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disabled-setuid-sandbox"],
    headless,
  });
  const page = await browser.newPage();
  const generator = G(api);
  let data = "";

  const cleanHtml = (html) => html.replace("\n", "").trim();

  const chain = async (nextG) => {
    const {done, value} = await nextG.next(cleanHtml(data));
    if (done) {
      await browser.close();
      return Promise.resolve(cleanHtml(data));
    }
    await value(page);
    /* istanbul ignore next */
    data = await page.$eval("body", (elem) => elem.innerHTML);

    return chain(nextG);
  };

  return ofP(chain(generator));
};
