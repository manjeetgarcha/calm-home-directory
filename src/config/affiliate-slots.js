/**
 * One slot per brand. Empty string keeps the plain retailer or stockist URL
 * from the launch files. A value must be a full http(s) URL; it then replaces
 * the href of every link with that data-affiliate-slot.
 *
 * No affiliate IDs are configured. Paint slot names match affiliate_link_slot
 * in paints_launch (COAT, Little_Greene). Product slots are the brand field.
 */
export const affiliateSlots = {
  Tala: "",
  "Prisma Lighting": "",
  Pooky: "",
  Lumie: "",
  WoodUpp: "",
  Felted: "",
  Naturewall: "",
  NEOM: "",
  "British Wool / Agnella": "",
  Alpine: "",
  COAT: "",
  Little_Greene: "",
};

export function resolveHref(slot, plainUrl) {
  const mapped = affiliateSlots[slot];
  if (typeof mapped === "string" && /^https?:\/\//i.test(mapped.trim())) {
    return mapped.trim();
  }
  return plainUrl || "";
}
