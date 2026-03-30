import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import Link from "next/link";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import MatchedClient from "./MatchedClient";

export const dynamic = "force-dynamic";

export default async function MatchedOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>로그인이 필요합니다.</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex flex-col gap-2 mb-10">
        <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 w-min whitespace-nowrap">
          <ArrowLeft className="w-4 h-4" /> 뒤로 가기
        </Link>
        <h1 className="text-3xl font-bold font-outfit text-indigo-950 flex items-center gap-3">
          <HeartHandshake className="w-8 h-8 text-indigo-500" />
          매칭된 커스텀 주문
        </h1>
        <p className="text-gray-500 font-medium">고객님이 채택한 견적 리스트입니다. 꽃다발 제작 후 이야기를 불어넣어 등록하세요!</p>
      </div>

      <Suspense fallback={<MatchedSkeleton />}>
        <MatchedData userId={user.id} />
      </Suspense>
    </div>
  );
}

function MatchedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse border border-indigo-100" />
      ))}
    </div>
  );
}

async function MatchedData({ userId }: { userId: string }) {
  const admin = createAdminClient();

  const { data: shop } = await admin
    .from("shops")
    .select("id")
    .eq("owner_id", userId)
    .single();

  let acceptedQuotes: any[] = [];
  if (shop) {
    const { data } = await admin
      .from("custom_quotes")
      .select(`*, request:custom_requests (*)`)
      .eq("shop_id", shop.id)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    if (data) {
      acceptedQuotes = await Promise.all(
        data.map(async (quote) => {
          let buyerPhone = "연락처 미상";
          if (quote.request?.buyer_id) {
            const { data: userData } = await admin.auth.admin.getUserById(quote.request.buyer_id);
            if (userData?.user?.user_metadata?.phone) {
              buyerPhone = userData.user.user_metadata.phone;
            }
          }
          return { ...quote, buyer_phone: buyerPhone };
        })
      );
    }
  }

  return <MatchedClient acceptedQuotes={acceptedQuotes} />;
}
