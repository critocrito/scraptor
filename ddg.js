const {JSDOM} = require("jsdom");
const {Do} = require("./dist");

(async () => {
  let html;
  try {
    html = await Do(function* scrapeDdg({
      browse,
      input,
      clickUntil,
      clickToLoad,
    }) {
      yield browse("https://duckduckgo.com");
      yield input("#search_form_input_homepage", "Keith Johnstone");
      yield clickToLoad("#search_button_homepage");
      yield clickUntil(
        ".result--more__btn",
        (html) => {
          const {window} = new JSDOM(html);
          return (
            window.document.querySelectorAll(".result__body").length >= 100
          );
        },
        {timeout: 2000},
      );
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  const data = [];
  const {window} = new JSDOM(html);
  const results = window.document.querySelectorAll(".result__body");
  for (const r of results) {
    const title = r.querySelector("h2.result__title > a.result__a").textContent;
    const snippet = r.querySelector("div.result__snippet").textContent;
    const link = r.querySelector("h2.result__title > a.result__a").href;
    data.push({title, snippet, link});
  }
  console.log(data.length, data[0]);
})();
