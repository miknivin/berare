import type { Metadata } from "next"
import { createServerSupabaseClient } from "@berare/db/server"
import { getCurrentProfile } from "@/lib/data/profile"
import { ProfileForm } from "@/components/account/profile-form"

export const metadata: Metadata = { title: "Edit Profile" }

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = await getCurrentProfile()

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Edit Profile</h1>
      <ProfileForm profile={profile} email={user?.email ?? ""} />
    </div>
  )
}
