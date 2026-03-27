import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import RequestsClient from "./RequestsClient";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Auth required</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-outfit text-3xl font-semibold text-[var(--color-primary)] tracking-tight">
          맞춤 주문 요청 (역경매)
        </h1>
        <p className="text-[var(--color-secondary)]">
          새로운 고객들의 주문 요청을 확인하고 가장 먼저 견적을 제안해 보세요.
        </p>
      </div>

      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsData userId={user.id} />
      </Suspense>
    </div>
  );
}

function RequestsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
      ))}
    </div>
  );
}

async function RequestsData({ userId }: { userId: string }) {
  const admin = createAdminClient();

  const { data: requests, error } = await admin
    .from("custom_requests")
    .select("*")
    .in("status", ["pending", "quoting"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching requests:", error);
    return <div>오류가 발생했습니다.</div>;
  }

  const { data: shop } = await admin
    .from("shops")
    .select("id")
    .eq("owner_id", userId)
    .single();

  let myQuotes: any[] = [];
  if (shop) {
    const { data: quotes } = await admin
      .from("custom_quotes")
      .select("request_id")
      .eq("shop_id", shop.id);
    if (quotes) myQuotes = quotes;
  }

  const myQuoteRequestIds = myQuotes.map((q) => q.request_id);

  return (
    <RequestsClient initialRequests={requests || []} myQuoteRequestIds={myQuoteRequestIds} />
  );
}
