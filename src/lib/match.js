/** Directory labels for the five outcome tags stored in products_launch. */
export const OUTCOME_FILTERS = [
  {
    id: "evening-wind-down",
    label: "Evening wind-down",
    source: "Evening Cortisol Reduction",
  },
  {
    id: "sleep-support",
    label: "Sleep support",
    source: "Deep Sleep",
  },
  {
    id: "focus-low-visual-noise",
    label: "Focus & low visual noise",
    source: "ADHD Focus & Low Visual Noise",
  },
  {
    id: "acoustic-calm",
    label: "Acoustic calm",
    source: "Open-Plan Acoustic Calm",
  },
  {
    id: "sensory-kids",
    label: "Sensory-friendly kids' spaces",
    source: "Sensory-Safe Kids' Spaces",
  },
];

export const KELVIN_OPTIONS = [
  { id: "any", label: "Any Kelvin range" },
  { id: "under-2200", label: "Overlaps under 2,200 K" },
  { id: "2200-2700", label: "Overlaps 2,200–2,700 K" },
  { id: "2700-3000", label: "Overlaps 2,700–3,000 K" },
  { id: "3000-4000", label: "Overlaps 3,000–4,000 K" },
  { id: "4000-plus", label: "Overlaps 4,000 K or above" },
  { id: "unpublished", label: "Kelvin not published" },
];

export const CRI_OPTIONS = [
  { id: "any", label: "Any CRI" },
  { id: "95-plus", label: "CRI 95 or above" },
  { id: "98-plus", label: "CRI 98 or above" },
  { id: "unpublished", label: "CRI not published" },
];

export const FLICKER_OPTIONS = [
  { id: "any", label: "Any flicker note" },
  { id: "under-5", label: "Flicker under 5% (published)" },
  { id: "unpublished", label: "Flicker not published" },
];

export const ACOUSTIC_OPTIONS = [
  { id: "any", label: "Any acoustic rating" },
  { id: "published", label: "NRC or αw published" },
  { id: "0.7-plus", label: "NRC or αw of 0.7 or above" },
  { id: "unpublished", label: "NRC and αw not published" },
];

export const VOC_OPTIONS = [
  { id: "any", label: "Any VOC note" },
  { id: "unpublished", label: "No VOC certificate published" },
  { id: "fitting-note", label: "Low-VOC fitting note only (not a certificate)" },
];

export const PRICE_OPTIONS = [
  { id: "any", label: "Any price" },
  { id: "under-25", label: "Under £25" },
  { id: "25-75", label: "£25 to under £75" },
  { id: "75-150", label: "£75 to under £150" },
  { id: "150-plus", label: "£150 and over" },
];

export const LRV_OPTIONS = [
  { id: "any", label: "Any LRV" },
  { id: "under-20", label: "Under 20" },
  { id: "20-40", label: "20 to under 40" },
  { id: "40-60", label: "40 to under 60" },
  { id: "60-80", label: "60 to under 80" },
  { id: "80-plus", label: "80 and above" },
];

export const ORIENTATIONS = [
  { id: "North", label: "North (N)" },
  { id: "South", label: "South (S)" },
  { id: "East", label: "East (E)" },
  { id: "West", label: "West (W)" },
];

const KELVIN_BANDS = {
  "under-2200": [0, 2199],
  "2200-2700": [2200, 2699],
  "2700-3000": [2700, 2999],
  "3000-4000": [3000, 3999],
  "4000-plus": [4000, 20000],
};

function searchOk(haystack, query) {
  const terms = String(query || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function kelvinOk(card, id) {
  if (!id || id === "any") return true;
  const published = card.kelvinMin !== null && card.kelvinMax !== null;
  if (id === "unpublished") return !published;
  if (!published) return false;
  const band = KELVIN_BANDS[id];
  if (!band) return true;
  const [low, high] = band;
  return card.kelvinMin <= high && card.kelvinMax >= low;
}

function criOk(card, id) {
  if (!id || id === "any") return true;
  if (id === "unpublished") return card.cri === null;
  if (card.cri === null) return false;
  if (id === "95-plus") return card.cri >= 95;
  if (id === "98-plus") return card.cri >= 98;
  return true;
}

function flickerOk(card, id) {
  if (!id || id === "any") return true;
  return card.flicker === id;
}

function acousticOk(card, id) {
  if (!id || id === "any") return true;
  const published = card.nrc !== null || card.alphaW !== null;
  if (id === "unpublished") return !published;
  if (id === "published") return published;
  if (id === "0.7-plus") {
    return (card.nrc !== null && card.nrc >= 0.7) || (card.alphaW !== null && card.alphaW >= 0.7);
  }
  return true;
}

function priceOk(price, id) {
  if (!id || id === "any") return true;
  if (id === "under-25") return price < 25;
  if (id === "25-75") return price >= 25 && price < 75;
  if (id === "75-150") return price >= 75 && price < 150;
  if (id === "150-plus") return price >= 150;
  return true;
}

function lrvOk(lrv, id) {
  if (!id || id === "any") return true;
  if (id === "under-20") return lrv < 20;
  if (id === "20-40") return lrv >= 20 && lrv < 40;
  if (id === "40-60") return lrv >= 40 && lrv < 60;
  if (id === "60-80") return lrv >= 60 && lrv < 80;
  if (id === "80-plus") return lrv >= 80;
  return true;
}

export function matchProduct(card, filters) {
  if (!searchOk(card.search, filters.search)) return false;
  if (filters.outcomes.length && !filters.outcomes.some((id) => card.outcomes.includes(id))) return false;
  if (!kelvinOk(card, filters.kelvin)) return false;
  if (!criOk(card, filters.cri)) return false;
  if (!flickerOk(card, filters.flicker)) return false;
  if (!acousticOk(card, filters.acoustic)) return false;
  if (filters.voc && filters.voc !== "any" && card.voc !== filters.voc) return false;
  if (filters.materials.length && !filters.materials.includes(card.material)) return false;
  if (!priceOk(card.price, filters.price)) return false;
  return true;
}

export function matchPaint(card, filters) {
  if (!searchOk(card.search, filters.search)) return false;
  if (filters.brands.length && !filters.brands.includes(card.brand)) return false;
  if (filters.orientations.length && !filters.orientations.some((aspect) => card.orientations.includes(aspect))) {
    return false;
  }
  if (!lrvOk(card.lrv, filters.lrv)) return false;
  if (filters.glare && filters.glare !== "any" && String(card.glare) !== String(filters.glare)) return false;
  if (filters.psych.length && !filters.psych.includes(card.psych)) return false;
  return true;
}

/**
 * Cuts that reproduce every glare_score in paints_launch.
 * They sit in the gaps between neighbouring shades. They are a reading of
 * this file, not a lighting-standard threshold.
 */
export function glareScoreFromIndex(index) {
  if (index < 22) return 1;
  if (index < 40) return 2;
  if (index < 65) return 3;
  if (index < 82) return 4;
  return 5;
}
