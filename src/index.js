import {ofP, collectP} from "dashp";
import {JSDOM} from "jsdom";
import puppeteer from "puppeteer";

const html = (selector = "body") => (page) =>
  page.$eval(
    selector,
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

const click = (selector) => async (page) => {
  await page.click(selector);
};

const clickToLoad = (selector) => async (page) => {
  await Promise.all([waitUntilLoaded()(page), click(selector)(page)]);
};

const clickUntil = (selector, pred, opts) => async (page) => {
  const {timeout} = Object.assign({timeout: 500}, opts);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const dom = await html()(page);
    // eslint-disable-next-line no-await-in-loop
    if (await pred(dom)) break;
    // eslint-disable-next-line no-await-in-loop
    await click(selector)(page);
    // eslint-disable-next-line no-await-in-loop
    await waitUntil(timeout)(page);
  }
};

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
    const dom = await html()(page);
    // eslint-disable-next-line no-await-in-loop
    if (await pred(dom)) break;
    // eslint-disable-next-line no-await-in-loop
    await scroll(selector, {times: 1, timeout})(page);
  }
};

const api = {
  browse,
  html,
  waitUntil,
  waitUntilLoaded,
  screenshot,
  input,
  click,
  clickToLoad,
  clickUntil,
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
  let counter = 0;
  const chain = async (nextG) => {
    console.log(counter);
    const {done, value} = await nextG.next(data);
    if (done) {
      await browser.close();
      return Promise.resolve(data);
    }
    await value(page);
    data = await html()(page);
    counter += 1;
    return chain(nextG);
  };

  return ofP(chain(generator));
};
