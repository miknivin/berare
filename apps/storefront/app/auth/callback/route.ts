import { createServerSupabaseClient } from "@berare/db/server"
import { NextResponse, type NextRequest } from "next/server"

// Handles the redirect back from Google after signInWithOAuth. Exchanges
// the PKCE `code` for a session, which persists it into cookies via the
// server client's setAll — Route Handlers (unlike Server Components) are
// allowed to mutate cookies directly, so this actually sticks.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent("Could not sign in with Google. Please try again.")}`
  )
}
