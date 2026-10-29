# Surrey & London Calm Home Directory

Live site: [https://manjeetgarcha.github.io/calm-home-directory](https://manjeetgarcha.github.io/calm-home-directory).

The published site has two parts.

- **Hub, Calm Products, and Calm Paints** are an Astro build. Products and paints are at `/products-and-paint/`, filtered from the launch files. Unknown specs are shown as “Not published”. Affiliate URLs, when you have them, go in `src/config/affiliate-slots.js` only.
- **Trades, builders and architects** is the static directory from `main`: `index.html`, `about.html`, `styles.css`, `app.js`, `data/listings.json`, and `assets/eudaspace-logo.png`. The build copies those files, unchanged, to `/trades/` so the relative links keep working. The homepage card points there.

`data/listings.json` is the public trade data (fit scores deliberately excluded). `assets/eudaspace-logo.png` is the Eudaspace wordmark from eudaspace.co.uk (Wix media 2553e1_68694e59...). Full data including hidden fit scores: `/workspace/calm-home-site-private/listings-full.json` and `/workspace/calm-home-directory.csv`.

## Trade directory on its own

From the repo root:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765/ . That serves the trade directory exactly as it is stored.

## Full site

```bash
npm install
npm test
npm run preview
```

Open `http://localhost:4321/calm-home-directory/`. `npm test` checks the product and paint files, builds the site, copies the trade directory into `dist/trades/`, and checks the HTML.

Product and paint sources:

- `src/data/products_launch.json` and `src/data/products_launch.csv`
- `src/data/paints_launch.json` and `src/data/paints_launch.csv`

## GitHub Pages

`.github/workflows/pages.yml` is the only deploy. It builds on pull requests and deploys the `dist/` folder from `main`.

1. In the GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge to `main`.
4. Open the **Actions** tab and wait for **Deploy GitHub Pages** to finish.
5. The site is at `https://manjeetgarcha.github.io/calm-home-directory/`.

Do not switch Pages to “Deploy from a branch”.
