import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import { redirect } from "next/navigation";
import ArchiveClient from "./ArchiveClient";
import LogoutButton from "@/components/LogoutButton";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
        <Suspense fallback={<ArchiveSkeleton />}>
          <ArchiveData userId={user.id} />
        </Suspense>
      </main>
    </div>
  );
}

function ArchiveSkeleton() {
  return (
    <>
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
        ))}
      </div>
    </>
  );
}

async function ArchiveData({ userId }: { userId: string }) {
  const admin = createAdminClient();

  const { data: archives } = await admin
    .from("archives")
    .select("*")
    .eq("visitor_id", userId)
    .order("created_at", { ascending: false });

  const { data: myRequests } = await admin
    .from("custom_requests")
    .select("*")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  return (
    <ArchiveClient
      initialArchives={archives ?? []}
      myRequests={myRequests ?? []}
      userId={userId}
    />
  );
}
