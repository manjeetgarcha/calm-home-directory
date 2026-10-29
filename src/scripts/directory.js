import { matchPaint, matchProduct } from "../lib/match.js";
import { datasetToPaint, datasetToProduct } from "../lib/records.js";

function readChecked(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function readProductFilters(form) {
  return {
    search: form.querySelector('[name="search"]')?.value || "",
    outcomes: readChecked(form, "outcome"),
    kelvin: form.querySelector('[name="kelvin"]')?.value || "any",
    cri: form.querySelector('[name="cri"]')?.value || "any",
    flicker: form.querySelector('[name="flicker"]')?.value || "any",
    acoustic: form.querySelector('[name="acoustic"]')?.value || "any",
    voc: form.querySelector('[name="voc"]')?.value || "any",
    materials: readChecked(form, "material"),
    price: form.querySelector('[name="price"]')?.value || "any",
  };
}

function readPaintFilters(form) {
  return {
    search: form.querySelector('[name="search"]')?.value || "",
    brands: readChecked(form, "brand"),
    orientations: readChecked(form, "orientation"),
    lrv: form.querySelector('[name="lrv"]')?.value || "any",
    glare: form.querySelector('[name="glare"]')?.value || "any",
    psych: readChecked(form, "psych"),
  };
}

function applyList({ cards, match, count, empty, noun }) {
  let shown = 0;
  for (const card of cards) {
    const ok = match(card);
    card.hidden = !ok;
    if (ok) shown += 1;
  }
  count.textContent = `${shown} of ${cards.length} ${noun}`;
  empty.hidden = shown !== 0;
}

function markDirectoryNav(tabId) {
  if (!location.pathname.includes("/products-and-paint/")) return;
  for (const key of ["products", "paints"]) {
    document.getElementById(`nav-${key}`)?.removeAttribute("aria-current");
  }
  const key = tabId === "tab-paints" ? "paints" : "products";
  document.getElementById(`nav-${key}`)?.setAttribute("aria-current", "page");
}

function selectTab(root, tabId, updateHash) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  for (const tab of tabs) {
    const selected = tab.id === tabId;
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const panel of panels) {
    const selected = panel.getAttribute("aria-labelledby") === tabId;
    panel.hidden = !selected;
  }
  markDirectoryNav(tabId);
  if (updateHash) {
    const hash = tabId === "tab-paints" ? "#paints" : "#products";
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }
}

export function initDirectory() {
  const root = document.querySelector("[data-directory]");
  if (!root) return;

  const productForm = root.querySelector("[data-product-filters]");
  const paintForm = root.querySelector("[data-paint-filters]");
  const productCards = [...root.querySelectorAll("[data-product-card]")];
  const paintCards = [...root.querySelectorAll("[data-paint-card]")];

  const applyProducts = () =>
    applyList({
      cards: productCards,
      match: (card) => matchProduct(datasetToProduct(card), readProductFilters(productForm)),
      count: root.querySelector("[data-product-count]"),
      empty: root.querySelector("[data-product-empty]"),
      noun: "products",
    });

  const applyPaints = () =>
    applyList({
      cards: paintCards,
      match: (card) => matchPaint(datasetToPaint(card), readPaintFilters(paintForm)),
      count: root.querySelector("[data-paint-count]"),
      empty: root.querySelector("[data-paint-empty]"),
      noun: "shades",
    });

  productForm.addEventListener("input", applyProducts);
  productForm.addEventListener("change", applyProducts);
  productForm.addEventListener("submit", (event) => event.preventDefault());
  productForm.querySelector(".reset").addEventListener("click", () => {
    productForm.reset();
    applyProducts();
  });

  paintForm.addEventListener("input", applyPaints);
  paintForm.addEventListener("change", applyPaints);
  paintForm.addEventListener("submit", (event) => event.preventDefault());
  paintForm.querySelector(".reset").addEventListener("click", () => {
    paintForm.reset();
    applyPaints();
  });

  const tablist = root.querySelector('[role="tablist"]');
  tablist.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    selectTab(root, tab.id, true);
  });

  tablist.addEventListener("keydown", (event) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next = null;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
    selectTab(root, next.id, true);
  });

  const initial = location.hash === "#paints" ? "tab-paints" : "tab-products";
  selectTab(root, initial, false);
  applyProducts();
  applyPaints();

  window.addEventListener("hashchange", () => {
    selectTab(root, location.hash === "#paints" ? "tab-paints" : "tab-products", false);
  });
}
