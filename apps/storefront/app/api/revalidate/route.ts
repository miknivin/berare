import { NextResponse, type NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { isCacheTag } from "@/lib/cache-tags"

// Called by the admin app (a separate deployment) right after it mutates
// data the storefront caches — revalidateTag() only affects the cache of
// the process it runs in, so cross-app invalidation has to go over HTTP.
// The 60s revalidate on each unstable_cache call is the safety net if this
// is ever missed (network blip, secret rotated out of sync, etc).
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret")
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const tag = body?.tag

  if (typeof tag !== "string" || !isCacheTag(tag)) {
    return NextResponse.json({ error: "Unknown or missing tag" }, { status: 400 })
  }

  // { expire: 0 } — this runs in a Route Handler, not a Server Action, so
  // updateTag() (the immediate-expiration option) isn't available here;
  // this is the closest equivalent for a webhook-triggered invalidation.
  revalidateTag(tag, { expire: 0 })
  return NextResponse.json({ revalidated: true, tag })
}
