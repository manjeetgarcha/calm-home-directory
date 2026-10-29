import { OUTCOME_FILTERS } from "./match.js";
import {
  flickerKind,
  nullableNumber,
  orientationList,
  outcomeIds,
  vocKind,
} from "./format.js";

function squash(parts) {
  return parts
    .filter((part) => part !== null && part !== undefined && String(part).trim() !== "")
    .join(" ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function toProductCard(product) {
  const ids = outcomeIds(product.outcomes);
  const labels = ids.map((id) => OUTCOME_FILTERS.find((item) => item.id === id)?.label || "");
  return {
    search: squash([
      product.brand,
      product.name,
      product.category,
      product.subcategory,
      product.material,
      product.material_group,
      product.key_specs,
      product.outcomes,
      ...labels,
    ]),
    outcomes: ids,
    kelvinMin: nullableNumber(product.kelvin_min),
    kelvinMax: nullableNumber(product.kelvin_max),
    cri: nullableNumber(product.cri),
    flicker: flickerKind(product.flicker),
    nrc: nullableNumber(product.nrc),
    alphaW: nullableNumber(product.alpha_w),
    voc: vocKind(product.voc_cert),
    material: product.material,
    price: Number(product.price_gbp),
  };
}

export function toPaintCard(paint) {
  const orientations = orientationList(paint.orientation);
  return {
    search: squash([
      paint.brand,
      paint.name,
      paint.code,
      paint.undertone,
      paint.temperature,
      paint.finish_ref,
      paint.maker_description,
      paint.psych_effect,
      paint.orientation,
      paint.glare_band,
    ]),
    brand: paint.brand,
    orientations,
    lrv: Number(paint.lrv),
    glare: Number(paint.glare_score),
    psych: paint.psych_effect,
  };
}

export function datasetToProduct(el) {
  const num = (name) => {
    const value = el.dataset[name];
    if (value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isNaN(number) ? null : number;
  };
  return {
    search: el.dataset.search || "",
    outcomes: (el.dataset.outcomes || "").split(/\s+/).filter(Boolean),
    kelvinMin: num("kelvinMin"),
    kelvinMax: num("kelvinMax"),
    cri: num("cri"),
    flicker: el.dataset.flicker || "unpublished",
    nrc: num("nrc"),
    alphaW: num("alphaW"),
    voc: el.dataset.voc || "unpublished",
    material: el.dataset.material || "",
    price: num("price") ?? 0,
  };
}

export function datasetToPaint(el) {
  const lrv = Number(el.dataset.lrv);
  const glare = Number(el.dataset.glare);
  return {
    search: el.dataset.search || "",
    brand: el.dataset.brand || "",
    orientations: (el.dataset.orientations || "").split(/\s+/).filter(Boolean),
    lrv: Number.isNaN(lrv) ? 0 : lrv,
    glare: Number.isNaN(glare) ? 0 : glare,
    psych: el.dataset.psych || "",
  };
}
