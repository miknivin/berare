import "server-only"
import { z } from "zod"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@berare/db/server"

// No auth required — this is a public lead-capture form (e.g. "enquire
// about this offer" from a homepage banner), so the visitor is often not
// signed in at all. RLS's public insert policy is what actually enforces
// that this can only ever write, never read anything back.
const enquirySchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    phone: z.string().trim().max(20).optional(),
    email: z.string().trim().email("Enter a valid email").max(320).optional(),
    message: z.string().trim().max(2000).optional(),
    source: z.string().trim().max(200).optional(),
  })
  .refine((data) => data.phone || data.email, {
    message: "A phone number or email is required",
    path: ["phone"],
  })

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("enquiries").insert({
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    message: parsed.data.message || null,
    source: parsed.data.source || null,
  })

  if (error) {
    return NextResponse.json({ error: "Could not submit enquiry" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
