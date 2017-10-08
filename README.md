# `scraptor`

!!This library is a work in progress. The API most likely will change.!!

This library is my attempt to wrap `puppeteer` and `cheerio` to create a
library that allows me to easily construct web scrapers. A DSL implements
common patterns, while allowing to break out into the underlying libraries if
necessary.

## Synopsis

```javascript
import {browse, once, fillForm, click, html, usingHeadlessBrowser} from "scraptor";
import {flowP} from "combinators-p";

const spinnerDone = "document.querySelector('.spinner').classList.contains('hide')";
const waitForSpinner = once(spinnerDone);
const search = (url, term) =>
  flowP([
    browse,
    waitForSpinner,
    fillForm("#search"),
    click("button.search"),
    waitForSpinner,
    html("body"),
  ], url);

usingHeadlessBrowser(search("https://example.org", "Keith Johnstone"))
  .then(console.log); // Prints full HTML
```

## API

- [`usingBrowser`: Execute a scrape in a browser session.](#usingBrowser)
- [`usingHeadlessBrowser`: Execute a scrape in a headless browser session.](#usingHeadlessBrowser)
- [`browse`: Visit a URL and load the page.](#browse)
- [`html`: Select the inner HTML of a DOM node.](#html)
- [`fillForm`: Input a string into a form field.](#fillForm)
- [`click`: Click on an DOM node.](#click)
- [`once`: Continue the browser session once a predicate fulfills.](#once)
- [`onceLoaded`: Continue the browser session once the page loaded.](#onceLoaded)
- [`onceMs`: Continue browser session once a set time passes.](#onceMs)
- [`doUntil`: Run an action once a predicate fulfills.](#doUntil)

### usingBrowser

### usingHeadlessBrowser

### browse

### html

### fillForm

### click

### once

### onceLoaded

### onceMs

### doUntil
