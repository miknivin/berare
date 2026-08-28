import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@berare/db/server"
import { getCurrentProfile } from "@/lib/data/profile"
import { ApplyForm } from "@/components/affiliate/apply-form"

export const metadata: Metadata = { title: "Become an Affiliate" }

export default async function AffiliateApplyPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/affiliate-apply")

  const [profile, { data: affiliate }, { data: applications }] = await Promise.all([
    getCurrentProfile(),
    supabase.from("affiliates").select("id").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("affiliate_applications")
      .select("id, status, admin_note")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  const latestApplication = applications?.[0] ?? null
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_URL ?? "#"

  return (
    <div className="mx-auto max-w-xl px-4 md:px-6 py-16">
      <h1 className="font-heading text-3xl mb-2">Become an Affiliate</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Earn rewards by sharing Berare products with your audience.
      </p>

      {affiliate ? (
        <div className="rounded-xl border border-border p-6 text-center">
          <p className="font-medium mb-4">You&apos;re already an approved affiliate!</p>
          <a
            href={affiliateUrl}
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Go to Affiliate Portal
          </a>
        </div>
      ) : latestApplication?.status === "pending" ? (
        <div className="rounded-xl border border-border p-6 text-center">
          <p className="font-medium">Your application is under review.</p>
          <p className="text-sm text-muted-foreground mt-2">We&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <>
          {latestApplication?.status === "rejected" && (
            <div className="rounded-xl border border-border bg-muted/40 p-4 mb-6 text-sm">
              <p className="font-medium mb-1">Your previous application wasn&apos;t approved.</p>
              {latestApplication.admin_note && (
                <p className="text-muted-foreground">{latestApplication.admin_note}</p>
              )}
              <p className="text-muted-foreground mt-1">You&apos;re welcome to apply again below.</p>
            </div>
          )}
          <ApplyForm
            defaultFullName={profile?.full_name ?? ""}
            defaultEmail={user.email ?? ""}
            defaultPhone={profile?.phone ?? ""}
          />
        </>
      )}
    </div>
  )
}
