import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import { redirect } from "next/navigation";
import ArchiveClient from "./ArchiveClient";
import LogoutButton from "@/components/LogoutButton";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: archives } = await admin
    .from("archives")
    .select("*")
    .eq("visitor_id", user.id)
    .order("created_at", { ascending: false });

  const { data: myRequests } = await admin
    .from("custom_requests")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)]">
      <header className="h-header px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
        <div className="flex items-center">
          <span className="font-outfit text-lg font-semibold tracking-tight text-[var(--color-primary)]">
            ON:HWA
          </span>
          <span className="ml-3 text-sm text-[var(--color-secondary)]">나의 포토카드 아카이브</span>
        </div>
        <LogoutButton />
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <ArchiveClient initialArchives={archives ?? []} myRequests={myRequests ?? []} userId={user.id} />
      </main>
    </div>
  );
}
