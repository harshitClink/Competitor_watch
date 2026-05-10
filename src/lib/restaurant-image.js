/** Local placeholder when API omits `image_url` (matches app palette). */
export const RESTAURANT_PLACEHOLDER = "/restaurant-placeholder.svg";

/**
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function restaurantImageSrc(url) {
  if (url == null) return RESTAURANT_PLACEHOLDER;
  const s = String(url).trim();
  return s !== "" ? s : RESTAURANT_PLACEHOLDER;
}
