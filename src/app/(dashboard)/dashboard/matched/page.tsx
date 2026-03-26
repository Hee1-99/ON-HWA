import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, User, HeartHandshake, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchedOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>로그인이 필요합니다.</div>;

  const admin = createAdminClient();

  const { data: shop } = await admin.from("shops").select("id").eq("owner_id", user.id).single();
  
  let acceptedQuotes: any[] = [];
  if (shop) {
    const { data } = await admin
      .from("custom_quotes")
      .select(`
        *,
        request:custom_requests (*)
      `)
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

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 w-min whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> 뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold font-outfit text-indigo-950 flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-indigo-500" />
            매칭된 커스텀 주문
          </h1>
          <p className="text-gray-500 font-medium">고객님이 채택한 견적 리스트입니다. 연락을 취해 주문을 확정해주세요!</p>
        </div>
      </div>

      {acceptedQuotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 py-24 gap-4">
          <CheckCircle className="w-12 h-12 text-gray-300" />
          <p className="font-bold text-gray-500">아직 매칭된 주문이 없습니다.</p>
          <p className="text-sm text-gray-400">커스텀 주문 요청에 견적을 제안하고 고객의 선택을 기다려보세요.</p>
          <Link href="/dashboard/requests" className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-100 transition-colors">요청 확인하러 가기</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {acceptedQuotes.map(quote => (
            <div key={quote.id} className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group hover:shadow-lg hover:border-indigo-300 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] pointer-events-none -z-10 transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start z-10 border-b border-gray-50 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 매칭 일시: {new Date(quote.created_at).toLocaleString()}
                  </span>
                  <div className="text-2xl font-bold text-indigo-950 flex items-center gap-2">
                    {quote.price.toLocaleString()}원
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                      최종 견적가
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="flex flex-col gap-4 z-10">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">고객 요청 사항</span>
                    <p className="text-sm font-bold text-gray-900 leading-relaxed break-keep">
                      대상: {quote.request.recipient_target}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1 border-l-2 border-gray-200 pl-3 py-1">
                      {quote.request.occasion}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">내가 보낸 견적 메시지</span>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.description}</p>
                </div>
                
                <div className="mt-2 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col gap-3">
                   <p className="text-sm font-bold text-indigo-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
                     <Phone className="w-4 h-4" /> 구매자 연락처: {quote.buyer_phone}
                   </p>
                   <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                     고객님이 사장님의 견적을 확정했습니다! 위 연락처로 확인하여 제작 및 수령 방식을 최종 조율해주세요.
                   </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
