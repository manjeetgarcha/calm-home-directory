import fs from "node:fs";
import path from "node:path";

const dest = "dist/trades";
fs.mkdirSync(path.join(dest, "data"), { recursive: true });
fs.mkdirSync(path.join(dest, "assets"), { recursive: true });

for (const file of ["index.html", "about.html", "app.js", "styles.css"]) {
  fs.copyFileSync(file, path.join(dest, file));
}
fs.copyFileSync("data/listings.json", path.join(dest, "data/listings.json"));
fs.copyFileSync("assets/eudaspace-logo.png", path.join(dest, "assets/eudaspace-logo.png"));

const sitemapPath = "dist/sitemap-0.xml";
if (fs.existsSync(sitemapPath)) {
  const origin = "https://manjeetgarcha.github.io/calm-home-directory/";
  let xml = fs.readFileSync(sitemapPath, "utf8");
  const urls = [`${origin}trades/`, `${origin}trades/about.html`];
  for (const url of urls) {
    if (!xml.includes(url)) {
      xml = xml.replace("</urlset>", `<url><loc>${url}</loc></url></urlset>`);
    }
  }
  fs.writeFileSync(sitemapPath, xml);
}

console.log("Copied the trade directory into dist/trades/");
