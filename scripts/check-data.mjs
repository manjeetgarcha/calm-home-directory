import fs from "node:fs";
import { affiliateSlots } from "../src/config/affiliate-slots.js";
import { displayText, outcomeTokens, paintSlot } from "../src/lib/format.js";
import { glareScoreFromIndex, matchPaint, matchProduct } from "../src/lib/match.js";
import { toPaintCard, toProductCard } from "../src/lib/records.js";

const products = JSON.parse(fs.readFileSync("src/data/products_launch.json", "utf8"));
const paints = JSON.parse(fs.readFileSync("src/data/paints_launch.json", "utf8"));

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((value) => value.length));
}

function csvObjects(path) {
  const rows = parseCsv(fs.readFileSync(path, "utf8"));
  const [header, ...body] = rows;
  return body.map((cells) => Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ""])));
}

function same(jsonValue, csvValue) {
  const empty = jsonValue === null || jsonValue === undefined || jsonValue === "";
  if (empty) return csvValue === null || csvValue === undefined || csvValue === "";
  if (typeof jsonValue === "number" || /^-?\d+(\.\d+)?$/.test(String(csvValue).trim())) {
    if (typeof jsonValue === "number" || /^-?\d+(\.\d+)?$/.test(String(jsonValue).trim())) {
      return Number(jsonValue) === Number(csvValue);
    }
  }
  return String(jsonValue) === String(csvValue);
}

function assertEqualFiles(jsonRows, csvPath) {
  const csvRows = csvObjects(csvPath);
  if (jsonRows.length !== csvRows.length) {
    throw new Error(`${csvPath} has ${csvRows.length} rows, JSON has ${jsonRows.length}`);
  }
  const keys = Object.keys(jsonRows[0]);
  for (let i = 0; i < jsonRows.length; i += 1) {
    for (const key of keys) {
      if (!same(jsonRows[i][key], csvRows[i][key])) {
        throw new Error(`${csvPath} row ${i} field ${key}: JSON ${jsonRows[i][key]} CSV ${csvRows[i][key]}`);
      }
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(products.length === 34, "expected 34 products");
assert(paints.length === 30, "expected 30 paints");
assertEqualFiles(products, "src/data/products_launch.csv");
assertEqualFiles(paints, "src/data/paints_launch.csv");

for (const product of products) {
  assert(affiliateSlots[product.brand] === "", `missing empty affiliate slot for ${product.brand}`);
  assert(product.url.startsWith("http"), `${product.name} needs a product URL`);
  for (const token of outcomeTokens(product.outcomes)) {
    assert(
      ["Evening Cortisol Reduction", "Deep Sleep", "ADHD Focus & Low Visual Noise", "Open-Plan Acoustic Calm", "Sensory-Safe Kids' Spaces"].includes(token),
      `unexpected outcome ${token}`,
    );
  }
  const card = toProductCard(product);
  assert(matchProduct(card, {
    search: "",
    outcomes: [],
    kelvin: "any",
    cri: "any",
    flicker: "any",
    acoustic: "any",
    voc: "any",
    materials: [],
    price: "any",
  }), `unfiltered product dropped: ${product.name}`);
}

for (const paint of paints) {
  const slot = paintSlot(paint.affiliate_link_slot);
  assert(affiliateSlots[slot] === "", `missing empty affiliate slot ${slot}`);
  assert(paint.shade_url.startsWith("http"), `${paint.name} needs a shade URL`);
  const raw = paint.lrv * (1 + paint.sheen_pct / 20);
  assert(Math.abs(raw - paint.glare_index) <= 0.05 + 1e-9, `${paint.name} glare index drifted`);
  assert(glareScoreFromIndex(paint.glare_index) === paint.glare_score, `${paint.name} glare score cut failed`);
}

const cards = products.map(toProductCard);
const paintCards = paints.map(toPaintCard);
const sleep = cards.filter((card) =>
  matchProduct(card, {
    search: " ",
    outcomes: ["sleep-support"],
    kelvin: "any",
    cri: "any",
    flicker: "any",
    acoustic: "any",
    voc: "any",
    materials: [],
    price: "any",
  }),
);
assert(sleep.length === 17, `sleep support count ${sleep.length}`);

const warm = cards.filter((card) =>
  matchProduct(card, {
    search: "",
    outcomes: [],
    kelvin: "under-2200",
    cri: "any",
    flicker: "any",
    acoustic: "any",
    voc: "any",
    materials: [],
    price: "any",
  }),
);
assert(warm.length > 0 && warm.every((card) => card.kelvinMin <= 2199 && card.kelvinMax >= 0), "kelvin overlap");

const unpublishedKelvin = cards.filter((card) => card.kelvinMin === null);
assert(
  unpublishedKelvin.every(
    (card) =>
      !matchProduct(card, {
        search: "",
        outcomes: [],
        kelvin: "2700-3000",
        cri: "any",
        flicker: "any",
        acoustic: "any",
        voc: "any",
        materials: [],
        price: "any",
      }),
  ),
  "unpublished kelvin leaked into a band",
);

assert(
  cards.filter((card) =>
    matchProduct(card, {
      search: "",
      outcomes: [],
      kelvin: "any",
      cri: "98-plus",
      flicker: "any",
      acoustic: "any",
      voc: "any",
      materials: [],
      price: "any",
    }),
  ).length === 2,
  "CRI 98 count",
);

assert(
  cards.filter((card) =>
    matchProduct(card, {
      search: "",
      outcomes: [],
      kelvin: "any",
      cri: "any",
      flicker: "under-5",
      acoustic: "any",
      voc: "any",
      materials: [],
      price: "any",
    }),
  ).length === 7,
  "flicker under 5% count",
);

assert(
  cards.filter((card) =>
    matchProduct(card, {
      search: "muffy kids",
      outcomes: [],
      kelvin: "any",
      cri: "any",
      flicker: "any",
      acoustic: "any",
      voc: "any",
      materials: [],
      price: "any",
    }),
  ).length === 1,
  "search muffy",
);

const fitting = cards.filter((card) => card.voc === "fitting-note");
assert(fitting.length === 1, "expected one low-VOC fitting note");
assert(displayText("unknown").includes("Not published"), "unknown display");
assert(displayText("unknown (fitting uses low-VOC adhesive advice)").startsWith("Not published"), "voc display");
assert(displayText(null) === "Not published", "null display");

const toad = paintCards.filter((card) =>
  matchPaint(card, {
    search: "",
    brands: ["Little Greene"],
    orientations: [],
    lrv: "any",
    glare: "1",
    psych: [],
  }),
);
assert(toad.length === 1 && toad[0].brand === "Little Greene", "Little Greene glare 1");

const north = paintCards.filter((card) =>
  matchPaint(card, {
    search: "",
    brands: [],
    orientations: ["North"],
    lrv: "under-20",
    glare: "any",
    psych: ["Cocooning"],
  }),
);
assert(north.length >= 1, "north dark cocooning");

console.log("data checks passed");
