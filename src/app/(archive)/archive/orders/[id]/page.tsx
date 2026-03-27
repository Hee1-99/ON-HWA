import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import BuyerOrderClient from "./BuyerOrderClient";

export const dynamic = "force-dynamic";

export default async function BuyerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>로그인이 필요합니다.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderData id={id} userId={user.id} />
      </Suspense>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <>
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
      <div className="h-24 bg-gray-100 rounded-2xl animate-pulse border border-gray-200 mb-4" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
        ))}
      </div>
    </>
  );
}

async function OrderData({ id, userId }: { id: string; userId: string }) {
  const admin = createAdminClient();

  const { data: request, error: reqError } = await admin
    .from("custom_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (reqError || !request || request.buyer_id !== userId) {
    return <div>요청을 찾을 수 없거나 열람 권한이 없습니다.</div>;
  }

  const { data: quotes } = await admin
    .from("custom_quotes")
    .select(`
      *,
      shops (
        owner_id,
        name,
        slug
      )
    `)
    .eq("request_id", id)
    .order("price", { ascending: true });

  let formattedQuotes: any[] = [];
  if (quotes) {
    formattedQuotes = await Promise.all(
      quotes.map(async (q) => {
        let shopPhone = "연락처 미상";
        if (q.shops?.owner_id) {
          const { data: userData } = await admin.auth.admin.getUserById(q.shops.owner_id);
          if (userData?.user?.user_metadata?.phone) {
            shopPhone = userData.user.user_metadata.phone;
          }
        }
        return {
          ...q,
          shop_name: q.shops?.name || "알 수 없는 상점",
          shop_phone: shopPhone,
        };
      })
    );
  }

  return <BuyerOrderClient request={request} initialQuotes={formattedQuotes} />;
}
