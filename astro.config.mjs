import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

/**
 * Live site: https://manjeetgarcha.github.io/calm-home-directory
 * Base is fixed so asset, canonical and Open Graph URLs match GitHub Pages.
 */
const site = "https://manjeetgarcha.github.io";
const base = "/calm-home-directory";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  integrations: [sitemap()],
});
