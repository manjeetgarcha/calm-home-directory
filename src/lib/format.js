import { OUTCOME_FILTERS } from "./match.js";

export const NOT_PUBLISHED = "Not published";

export function displayText(value) {
  if (value === null || value === undefined) return NOT_PUBLISHED;
  const text = String(value).trim();
  if (!text || /^unknown$/i.test(text)) return NOT_PUBLISHED;
  if (/^unknown\b/i.test(text)) {
    const rest = text.replace(/^unknown\b/i, "").trim();
    return rest ? `Not published ${rest}` : NOT_PUBLISHED;
  }
  return text;
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return NOT_PUBLISHED;
  const number = Number(value);
  if (Number.isNaN(number)) return NOT_PUBLISHED;
  const hasPence = Math.round(number * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatKelvin(min, max) {
  if (min === null || min === undefined || min === "" || max === null || max === undefined || max === "") {
    return NOT_PUBLISHED;
  }
  const low = Number(min);
  const high = Number(max);
  if (Number.isNaN(low) || Number.isNaN(high)) return NOT_PUBLISHED;
  const fmt = (n) => n.toLocaleString("en-GB");
  if (low === high) return `${fmt(low)} K`;
  return `${fmt(low)}–${fmt(high)} K`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return NOT_PUBLISHED;
  const number = Number(value);
  if (Number.isNaN(number)) return NOT_PUBLISHED;
  return number.toLocaleString("en-GB");
}

export function outcomeTokens(outcomes) {
  return String(outcomes || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function outcomeIds(outcomes) {
  return outcomeTokens(outcomes).map((token) => {
    const found = OUTCOME_FILTERS.find((item) => item.source === token);
    if (!found) {
      throw new Error(`Unmapped outcome in launch file: ${token}`);
    }
    return found.id;
  });
}

export function flickerKind(flicker) {
  if (typeof flicker === "string" && flicker.includes("<5%")) return "under-5";
  return "unpublished";
}

export function vocKind(voc) {
  if (typeof voc === "string" && /low-voc adhesive/i.test(voc)) return "fitting-note";
  return "unpublished";
}

/** Launch file groups some acoustic products under Glass / LED. Show both fields. */
export function materialGroupClash(group, material) {
  if (group !== "Glass / LED") return false;
  return !/glass|led|ceramic/i.test(String(material || ""));
}

export function paintSlot(affiliateLinkSlot) {
  const match = String(affiliateLinkSlot || "").match(/AFFILIATE_LINK_SLOT:([^}]+)/);
  return match ? match[1] : "";
}

export function orientationList(orientation) {
  return String(orientation || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function splitSource(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const match = text.match(/^(https?:\/\/\S+?)(?:\s+(.*))?$/);
  if (!match) return { href: "", text };
  return { href: match[1].replace(/[),.;]+$/, ""), text };
}

export function nullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}
