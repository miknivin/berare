import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@berare/db/server";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-[240px_1fr] gap-8 md:gap-16">
        <AccountSidebar />
        <div className="max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
