import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
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

  const baseUrl = process.env.CONTENT_API_URL?.trim();
  const token = process.env.CONTENT_API_TOKEN?.trim();
  if (!baseUrl || !token) {
    cacheLife({ stale: 60, revalidate: 300, expire: 86400 });
    return {};
  }

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
        cacheLife({ stale: 60, revalidate: 300, expire: 86400 });
        if (!sections || typeof sections !== "object" || Array.isArray(sections)) return {};
        await writeLastGood(sections);
        return sections;
      }
      // Status only: a 401 means the token is wrong, a 404 the address;
      // neither improves on a second try. 5xx and 429 get one retry.
      console.error("Panel content request failed:", response.status);
      await response.body?.cancel().catch(() => {});
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      console.error("Panel content request failed:", error?.message);
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  /*
   * On failure, the last content the panel sent (13 November 2026 audit),
   * cached for seconds rather than five minutes so the panel's return shows
   * quickly. This used to return `{}` cached like a good answer, so a short
   * outage during a refresh replaced every panel edit with the
   * app/content.js copy. Throwing is not an option: Next fails the render
   * and the build on an error thrown inside "use cache", even when caught.
   * The 5-minute expiry is Next's minimum for a page it can prerender.
   */
  cacheLife({ stale: 30, revalidate: 15, expire: 300 });
  return (await readLastGood()) ?? {};
}

/*
 * The last panel content received, kept in memory and in a file under
 * .next/cache so a restart or deploy during an outage still has it (the
 * build writes it too). Only touched inside the cached function above:
 * with Cache Components, file access outside "use cache" would stop the
 * page from being prerendered. Best effort: without it, the site falls
 * back to app/content.js as before.
 */
const LAST_GOOD_FILE = path.join(process.cwd(), ".next", "cache", "panel-content-last-good.json");
let lastGoodSections = null;

async function readLastGood() {
  if (lastGoodSections) return lastGoodSections;
  try {
    const stored = JSON.parse(await readFile(LAST_GOOD_FILE, "utf8"));
    if (stored && typeof stored === "object" && !Array.isArray(stored)) lastGoodSections = stored;
  } catch {
    // No file yet, or unreadable.
  }
  return lastGoodSections;
}

async function writeLastGood(sections) {
  lastGoodSections = sections;
  try {
    await mkdir(path.dirname(LAST_GOOD_FILE), { recursive: true });
    await writeFile(LAST_GOOD_FILE, JSON.stringify(sections));
  } catch {
    // Read-only disk: the in-memory copy still covers this process.
  }
}

// The page's content, in app/content.js's shape, with the panel's values applied.
export async function getSiteContent() {
  return buildSiteContent(await fetchPanelSections());
}
