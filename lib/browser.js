import {curry} from "lodash/fp";
import puppeteer from "puppeteer";
import {Future as F, flow as flowP, tap, delay} from "combinators-p";

export const browse = curry((url, page) => page.goto(url).then(() => page));

export const fillForm = curry((selector, value, page) =>
  page.click(selector).then(() => page.type(value)).then(() => page)
);

export const click = curry((selector, page) =>
  page.click(selector).then(() => page)
);

export const untilSelector = curry((selector, page) =>
  page.waitForSelector(selector).then(() => page)
);

export const untilLoaded = page => page.waitForNavigation().then(() => page);

export const untilMs = curry((ms, page) => delay(ms, F.of()).then(() => page));

export const usingHeadlessBrowser = fn =>
  puppeteer.launch().then(browser =>
    // eslint-disable-next-line promise/no-nesting
    browser.newPage().then(flowP([fn, tap(() => browser.close())]))
  );

export const usingBrowser = fn =>
  puppeteer.launch({headless: false}).then(browser =>
    // eslint-disable-next-line promise/no-nesting
    browser.newPage().then(flowP([fn, tap(() => browser.close())]))
  );

export default {
  browse,
  fillForm,
  click,
  untilSelector,
  untilLoaded,
  untilMs,
  usingBrowser,
  usingHeadlessBrowser,
};
