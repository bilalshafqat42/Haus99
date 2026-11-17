/*
 * Google Tag Manager container ID from NEXT_PUBLIC_GTM_ID (for example
 * GTM-ABC1234), read at build time. Anything that is not a well-formed ID
 * counts as unset, so a typo can never put arbitrary text into the page.
 * Shared by the layout (which loads the container) and next.config.mjs
 * (which opens the Content-Security-Policy for it).
 */
export function getGtmId() {
  const id = (process.env.NEXT_PUBLIC_GTM_ID ?? "").trim().toUpperCase();
  return /^GTM-[A-Z0-9]{4,12}$/.test(id) ? id : "";
}
