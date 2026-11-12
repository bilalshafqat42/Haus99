import { buildManifest } from "./sections";

/*
 * Tells the Refine Admin panel which sections and fields this site has, so
 * its editor can show them. Sent once each time the server starts (see
 * instrumentation.js); the panel ignores a push identical to the last one.
 * Skipped quietly until CONTENT_API_URL and CONTENT_API_TOKEN are set, and
 * never stops the site from starting.
 */
export async function pushManifestToPanel(env = process.env) {
  const baseUrl = env.CONTENT_API_URL?.trim();
  const token = env.CONTENT_API_TOKEN?.trim();
  if (!baseUrl || !token) return { pushed: false, reason: "unconfigured" };

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/v1/manifest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(buildManifest()),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Manifest push failed:", response.status, detail.slice(0, 500));
      return { pushed: false, reason: `status ${response.status}` };
    }
    const result = await response.json().catch(() => ({}));
    console.log(`Manifest pushed to panel: version ${result?.version ?? "unknown"}`);
    return { pushed: true };
  } catch (error) {
    console.error("Manifest push failed:", error?.message);
    return { pushed: false, reason: "error" };
  }
}
