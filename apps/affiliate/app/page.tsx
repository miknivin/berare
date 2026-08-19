import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@berare/db/server"
import { Button, buttonVariants } from "@/components/ui/button"

// Placeholder homepage for Phase 1 (auth) verification only. The real
// affiliate dashboard shell — apply/gate, links, earnings, withdrawals —
// is Phases 5-7, once the affiliate module exists.
export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center gap-6">
      <Image src="/logo.png" alt="Berare" width={300} height={166} className="h-10 w-auto" />
      <div>
        <h1 className="text-2xl font-semibold mb-2">Berare Affiliates</h1>
        <p className="text-muted-foreground max-w-md">
          The affiliate dashboard isn&apos;t built yet — this page just
          verifies sign-in is working end to end.
        </p>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" className="h-9">
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <Link href="/auth/login" className={buttonVariants({ className: "h-9" })}>
          Sign in
        </Link>
      )}
    </div>
  )
}
