# Surrey & London Calm Home Directory

Static directory for [Eudaspace](https://eudaspace.co.uk). The live site is
[https://manjeetgarcha.github.io/calm-home-directory](https://manjeetgarcha.github.io/calm-home-directory).

Three ways in:

- **Calm Products** and **Calm Paints** at `/products-and-paint/`, filtered from the launch files by biological and sensory specs.
- **Trades, builders & architects** at `/trades/`. No businesses are listed yet.
- A £195 floorplan and colour video audit, linked to harj@eudaspace.co.uk.

Unknown specs are shown as “Not published”. Product and sample links use the plain URLs in the data. Affiliate URLs, when you have them, go in `src/config/affiliate-slots.js` only.

## Develop

```bash
npm install
npm run dev
```

Open `http://localhost:4321/calm-home-directory/`.

```bash
npm test
npm run preview
```

`npm test` checks that the JSON and CSV launch files match, then builds `dist/` and checks the HTML.

## Data

- `src/data/products_launch.json` and `src/data/products_launch.csv`
- `src/data/paints_launch.json` and `src/data/paints_launch.csv`

The site renders from the JSON. The check script fails if the CSV copy disagrees.

## GitHub Pages

The workflow `.github/workflows/pages.yml` builds on pull requests and deploys only from `main`.

1. In the GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge this branch to `main`.
4. Open the **Actions** tab and wait for **Deploy GitHub Pages** to finish.
5. The site is published at `https://manjeetgarcha.github.io/calm-home-directory/`.

The Astro `base` is `/calm-home-directory`, so asset, canonical and Open Graph URLs use that path. Do not switch Pages to “Deploy from a branch”; the workflow uploads the built `dist/` folder.
