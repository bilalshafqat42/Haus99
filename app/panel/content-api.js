import { cacheLife, cacheTag } from "next/cache";
import { buildSiteContent } from "./sections";

/*
 * Reads this site's published content from the Refine Admin panel
 * (CONTENT_API_URL, authenticated with the site key in CONTENT_API_TOKEN).
 *
 * Never throws and never blanks the page: without the two settings, or if
 * the panel is slow, down or answers with an error, the site renders the
 * copy in app/content.js, exactly as it did before it was connected.
 *
 * Cached under the "content" tag. The panel calls /api/revalidate after
 * every save, which expires the tag so edits appear straight away; the
 * five-minute revalidate below only bounds how stale the page can get if a
 * refresh call is ever missed.
 */
export const CONTENT_CACHE_TAG = "content";
const REQUEST_TIMEOUT_MS = 5000;

async function fetchPanelSections() {
  "use cache";
  cacheTag(CONTENT_CACHE_TAG);
  cacheLife({ stale: 60, revalidate: 300, expire: 86400 });

  const baseUrl = process.env.CONTENT_API_URL?.trim();
  const token = process.env.CONTENT_API_TOKEN?.trim();
  if (!baseUrl || !token) return {};

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/v1/content`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      });
      if (response.ok) {
        const payload = await response.json();
        const sections = payload?.sections;
        return sections && typeof sections === "object" && !Array.isArray(sections) ? sections : {};
      }
      // Status only: a 401 means the token is wrong, a 404 the address;
      // neither improves on a second try. 5xx and 429 get one retry.
      console.error("Panel content request failed:", response.status);
      await response.body?.cancel().catch(() => {});
      if (response.status < 500 && response.status !== 429) return {};
    } catch (error) {
      console.error("Panel content request failed:", error?.message);
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return {};
}

// The page's content, in app/content.js's shape, with the panel's values applied.
export async function getSiteContent() {
  return buildSiteContent(await fetchPanelSections());
}
