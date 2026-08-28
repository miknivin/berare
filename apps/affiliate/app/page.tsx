import { redirect } from "next/navigation"
import Image from "next/image"
import { createServerSupabaseClient } from "@berare/db/server"
import { Button, buttonVariants } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"

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

  const [{ data: affiliate }, { data: applications }] = await Promise.all([
    supabase.from("affiliates").select("status").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("affiliate_applications")
      .select("status, admin_note")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  if (affiliate?.status === "active") {
    redirect("/dashboard")
  }

  const latestApplication = applications?.[0] ?? null
  const applyUrl = `${process.env.NEXT_PUBLIC_STOREFRONT_URL ?? ""}/affiliate-apply`

  let heading = "Apply to become an affiliate"
  let message = "You haven't applied yet. Head to the Berare storefront to submit your application."

  if (affiliate?.status === "suspended") {
    heading = "Your account is suspended"
    message = "Your affiliate account has been temporarily suspended. Contact us if you think this is a mistake."
  } else if (affiliate?.status === "deactivated") {
    heading = "Your account is deactivated"
    message = "Your affiliate account is no longer active."
  } else if (latestApplication?.status === "pending") {
    heading = "Application under review"
    message = "We're reviewing your application and will get back to you soon."
  } else if (latestApplication?.status === "rejected") {
    heading = "Application not approved"
    message =
      latestApplication.admin_note ||
      "Your application wasn't approved this time. You're welcome to apply again."
  }

  const canApply = !affiliate && (!latestApplication || latestApplication.status !== "pending")

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-6">
      <Image src="/logo.png" alt="Berare" width={300} height={166} className="h-10 w-auto" />
      <div>
        <h1 className="text-2xl font-semibold mb-2">{heading}</h1>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
      <div className="flex items-center gap-3">
        {canApply && (
          <a href={applyUrl} className={buttonVariants({ className: "h-9" })}>
            Apply Now
          </a>
        )}
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline" className="h-9">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}
