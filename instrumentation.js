/*
 * Runs once when the server starts: sends this site's editable sections to
 * the Refine Admin panel (app/panel/push-manifest.js). Fire and forget, so a
 * slow or unreachable panel never delays or stops the site starting.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { pushManifestToPanel } = await import("./app/panel/push-manifest");
    void pushManifestToPanel();
  } catch (error) {
    console.error("Manifest push could not start:", error?.message);
  }
}
