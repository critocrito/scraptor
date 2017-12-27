import {curry} from "lodash/fp";
import puppeteer from "puppeteer";
import {chainP, flowP} from "dashp";

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

export const once = curry((predicate, page) =>
  page.waitForFunction(predicate).then(() => page)
);

export const onceLoaded = page => page.waitForNavigation().then(() => page);

export const onceMs = once;

export const doUntil = curry((action, predicate, page) =>
  once(predicate, page)
    .then(watchDog => {
      action(page);
      return watchDog;
    })
    .then(() => page)
);

export const html = curry((selector, page) =>
  page.$(selector).then(handle =>
    // eslint-disable-next-line promise/no-nesting
    page
      .evaluate(elem => elem.innerHTML, handle)
      // eslint-disable-next-line promise/no-nesting
      .then(innerHtml => handle.dispose().then(() => innerHtml))
  )
);

export const usingHeadlessBrowser = fn =>
  puppeteer
    .launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]})
    .then(browser =>
      // eslint-disable-next-line promise/no-nesting
      browser.newPage().then(
        flowP([
          fn,
          chainP(data => {
            browser.close();
            return data;
          }),
        ])
      )
    );

export const usingBrowser = fn =>
  puppeteer
    .launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: false,
    })
    .then(browser =>
      // eslint-disable-next-line promise/no-nesting
      browser.newPage().then(
        flowP([
          fn,
          chainP(data => {
            browser.close();
            return data;
          }),
        ])
      )
    );

export default {
  browse,
  fillForm,
  click,
  untilSelector,
  once,
  onceLoaded,
  onceMs,
  html,
  usingBrowser,
  usingHeadlessBrowser,
};
