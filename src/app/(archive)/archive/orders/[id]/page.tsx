import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import BuyerOrderClient from "./BuyerOrderClient";

export const dynamic = "force-dynamic";

export default async function BuyerOrderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>로그인이 필요합니다.</div>;

  const admin = createAdminClient();
  
  // Fetch Request
  const { data: request, error: reqError } = await admin
    .from("custom_requests")
    .select("*")
    .eq("id", params.id)
    .single();

  if (reqError || !request || request.buyer_id !== user.id) {
    return <div>요청을 찾을 수 없거나 열람 권한이 없습니다.</div>;
  }

  // Fetch Quotes
  const { data: quotes, error: quoteError } = await admin
    .from("custom_quotes")
    .select(`
      *,
      shops (
        name,
        slug
      )
    `)
    .eq("request_id", params.id)
    .order("price", { ascending: true });

  const formattedQuotes = (quotes || []).map(q => ({
    ...q,
    shop_name: q.shops?.name || "알 수 없는 상점"
  }));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <BuyerOrderClient request={request} initialQuotes={formattedQuotes} />
    </div>
  );
}
