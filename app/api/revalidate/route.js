import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_CACHE_TAG } from "@/app/panel/content-api";

/*
 * Called by the Refine Admin panel after every save (Website Settings >
 * Revalidate webhook), with the shared secret as a Bearer token. Expires the
 * cached panel content and the page, so the next visitor sees the edit.
 * The secret here must equal the one saved in the panel.
 */
const digest = (value) => createHash("sha256").update(value, "utf8").digest();

function secretMatches(header, expected) {
  if (typeof header !== "string" || !header.startsWith("Bearer ")) return false;
  return timingSafeEqual(digest(header.slice(7)), digest(expected));
}

export async function POST(request) {
  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) {
    return Response.json({ error: "REVALIDATE_SECRET is not configured on this site." }, { status: 500 });
  }
  if (!secretMatches(request.headers.get("authorization"), expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    return Response.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidation failed:", error?.message);
    return Response.json({ error: "Revalidation failed." }, { status: 500 });
  }
}
