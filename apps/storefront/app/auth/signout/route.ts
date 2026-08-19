import { createServerSupabaseClient } from "@berare/db/server"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/", request.url))
}
