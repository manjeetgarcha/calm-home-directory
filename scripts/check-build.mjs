import fs from "node:fs";

const products = JSON.parse(fs.readFileSync("src/data/products_launch.json", "utf8"));
const paints = JSON.parse(fs.readFileSync("src/data/paints_launch.json", "utf8"));
const origin = "https://manjeetgarcha.github.io/calm-home-directory/";

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`missing ${path}`);
  return fs.readFileSync(path, "utf8").replace(/&#39;|&apos;/g, "'").replace(/&#38;|&amp;/g, "&").replace(/&quot;|&#34;/g, '"');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pages = {
  home: read("dist/index.html"),
  directory: read("dist/products-and-paint/index.html"),
  method: read("dist/methodology/index.html"),
  trades: read("dist/trades/index.html"),
  missing: read("dist/404.html"),
};

const all = Object.values(pages).join("\n");
assert(!/noindex/i.test(all), "found noindex");
assert(all.includes('lang="en-GB"'), "missing lang");

for (const [name, html] of Object.entries(pages)) {
  assert(html.includes('content="index, follow"'), `${name} missing robots index`);
  assert(html.includes("Not sure how your room's light interacts with your furniture?"), `${name} missing upsell`);
  assert(html.includes("mailto:harj@eudaspace.co.uk"), `${name} missing mailto`);
  assert(html.includes("Affiliate disclosure"), `${name} missing affiliate disclosure`);
  assert(html.includes(`href="${origin}`), `${name} canonical is not the Pages URL`);
  assert(!html.includes("{{AFFILIATE_LINK_SLOT"), `${name} leaked an affiliate placeholder`);
  assert(!/merchant\s+\d{4,}/.test(html), `${name} leaked a merchant id`);
}

assert(pages.home.includes("Calm Products"), "home missing Calm Products");
assert(pages.home.includes("Calm Paints"), "home missing Calm Paints");
assert(pages.home.includes("Trades, builders"), "home missing trades card");
assert(pages.home.includes("Work with Harj"), "home missing audit card");
assert(pages.home.includes("/calm-home-directory/products-and-paint/#products"), "home product link");
assert(pages.home.includes("/calm-home-directory/products-and-paint/#paints"), "home paint link");
assert(pages.home.includes("/calm-home-directory/trades/"), "home trades link");

assert(pages.trades.includes("Coming soon"), "trades page missing coming soon");
assert(pages.trades.includes("I have not published any businesses"), "trades page should not imply listings");

for (const product of products) {
  assert(pages.directory.includes(product.name), `missing product ${product.name}`);
}
for (const paint of paints) {
  assert(pages.directory.includes(paint.name), `missing paint ${paint.name}`);
}

assert(pages.directory.includes('data-affiliate-slot="Tala"'), "missing Tala slot");
assert(pages.directory.includes('data-affiliate-slot="COAT"'), "missing COAT slot");
assert(pages.directory.includes('data-affiliate-slot="Little_Greene"'), "missing Little Greene slot");
assert(pages.directory.includes("https://tala.co.uk/products/sphere-i-e27-dim-to-warm-led-bulb"), "plain Tala URL");
assert(pages.directory.includes(">Not published<"), "missing Not published");
assert(pages.directory.includes("Filter products"), "missing product filters");
assert(pages.directory.includes("Filter paints"), "missing paint filters");
assert(pages.directory.includes("Evening wind-down"), "missing outcome filter");
assert(pages.directory.includes("North (N)"), "missing orientation filter");

assert(pages.method.includes("Glare score method"), "methodology missing glare");
assert(pages.method.includes("1.15"), "methodology missing glare factor");
assert(pages.method.includes("Evening Cortisol Reduction"), "methodology missing filed outcome");
assert(pages.method.includes("/calm-home-directory/favicon.svg") || pages.home.includes("/calm-home-directory/favicon.svg"), "favicon base path");

assert(fs.existsSync("dist/sitemap-index.xml"), "missing sitemap");
const sitemap = read("dist/sitemap-index.xml") + read("dist/sitemap-0.xml");
assert(sitemap.includes(`${origin}products-and-paint/`), "sitemap missing directory");
assert(sitemap.includes(`${origin}trades/`), "sitemap missing trades");

console.log("build checks passed");
