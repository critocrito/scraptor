import {ofP, collectP} from "dashp";
import puppeteer from "puppeteer";

const body = (page) =>
  page.$eval(
    "body",
    /* istanbul ignore next */
    (el) => el.innerHTML,
  );

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

const click = (selector) => (page) => page.click(selector);

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

const scrollUntil = (selector, pred, opts) => async (page) => {
  const {timeout} = Object.assign({timeout: 1000}, opts);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const html = await body(page);
    // eslint-disable-next-line no-await-in-loop
    if (await pred(html)) break;
    // eslint-disable-next-line no-await-in-loop
    await scroll(selector, {times: 1, timeout})(page);
  }
};

const api = {
  browse,
  waitUntil,
  waitUntilLoaded,
  screenshot,
  input,
  click,
  scroll,
  scrollUntil,
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
    const {done, value} = await nextG.next(data);
    if (done) {
      await browser.close();
      return Promise.resolve(data);
    }
    await value(page);
    data = await body(page);

    return chain(nextG);
  };

  return ofP(chain(generator));
};
