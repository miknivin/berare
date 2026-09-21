import { redirect } from "next/navigation"
import Image from "next/image"
import { createServerSupabaseClient } from "@berare/db/server"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { ApplyForm } from "@/components/apply/apply-form"

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-8">
        <Image src="/logo.png" alt="Berare" width={300} height={166} className="h-10 w-auto" />
        <LoginForm />
      </div>
    )
  }

  const [{ data: affiliate }, { data: applications }, { data: profile }] = await Promise.all([
    supabase.from("affiliates").select("status").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("affiliate_applications")
      .select("status, admin_note")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
  ])

  if (affiliate?.status === "active") {
    redirect("/dashboard")
  }

  const latestApplication = applications?.[0] ?? null

  let heading = "Apply to become an affiliate"
  let message = "Fill out the form below — we'll email you once your application has been reviewed."

  if (affiliate?.status === "suspended") {
    heading = "Your account is suspended"
    message = "Your affiliate account has been temporarily suspended. Contact us if you think this is a mistake."
  } else if (affiliate?.status === "deactivated") {
    heading = "Your account is deactivated"
    message = "Your affiliate account is no longer active."
  } else if (latestApplication?.status === "pending") {
    heading = "Application under review"
    message = "Your application has been submitted for admin approval. We'll notify you by email once it's reviewed."
  } else if (latestApplication?.status === "rejected") {
    heading = "Application not approved"
    message =
      latestApplication.admin_note ||
      "Your application wasn't approved this time. You're welcome to apply again below."
  }

  const canApply = !affiliate && (!latestApplication || latestApplication.status !== "pending")

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-6">
      <Image src="/logo.png" alt="Berare" width={300} height={166} className="h-10 w-auto" />
      <div>
        <h1 className="text-2xl font-semibold mb-2">{heading}</h1>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>

      {canApply && (
        <ApplyForm
          defaultFullName={profile?.full_name ?? ""}
          defaultEmail={user.email ?? ""}
          defaultPhone={profile?.phone ?? ""}
        />
      )}

      <form action="/auth/signout" method="post">
        <Button type="submit" variant="outline" className="h-9">
          Sign out
        </Button>
      </form>
    </div>
  )
}
