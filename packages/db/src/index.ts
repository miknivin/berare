// Deliberately re-exports only types here. Browser/server/service-role
// clients are NOT barrelled together — each pulls in either "next/headers"
// or the service-role key, and bundling them into one entry point would let
// a client component accidentally drag server-only code (or vice versa)
// into the wrong bundle. Import the specific client you need instead:
//   import { createBrowserClient } from "@berare/db/browser"
//   import { createServerSupabaseClient } from "@berare/db/server"
//   import { createServiceRoleClient } from "@berare/db/service-role"
export type { Database } from "./types"
