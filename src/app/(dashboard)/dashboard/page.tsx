import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import LogoutButton from "@/components/LogoutButton";

import Link from "next/link";
import { Flower2, Inbox, MessageSquareShare, ArrowRight } from "lucide-react";

export default async function DashboardPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  // Fetch shop info
  const { data: shop } = await admin
    .from('shops')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  const shopName = shop?.name || "사장님";

  // Fetch quick stats
  const { count: pendingRequestsCount } = await admin
    .from("custom_requests")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "quoting"]);

  const { count: matchedOrdersCount } = await admin
    .from("custom_quotes")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shop?.id)
    .eq("status", "accepted");

  const { count: myProductsCount } = await admin
    .from("bouquets")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shop?.id);

  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold font-outfit text-[var(--color-primary)]">
          {shopName}의 대시보드
        </h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Products */}
        <Link href="/dashboard/products" className="group flex flex-col justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all h-64">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center group-hover:bg-gray-800 group-hover:text-white transition-colors">
              <Flower2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary)]">판매중인 상품</h2>
              <p className="text-sm text-gray-500 mt-1">등록된 꽃다발 큐레이션 및 판매 상태 관리</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-bold text-gray-900">{myProductsCount || 0}개 상품</span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Card 2: Custom Requests */}
        <Link href="/dashboard/requests" className="group flex flex-col justify-between bg-[var(--color-bg-default)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)] hover:shadow-xl hover:border-[var(--warm-rose)] hover:-translate-y-1 transition-all h-64 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--warm-rose)] opacity-5 rounded-bl-full pointer-events-none" />
          <div className="flex flex-col gap-4 relative">
            <div className="w-12 h-12 bg-white shadow-sm text-[var(--warm-rose)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--warm-rose)] group-hover:text-white transition-colors">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary)]">커스텀 주문 요청</h2>
              <p className="text-sm text-[var(--color-secondary)] mt-1">새로운 역경매 요청을 확인하고 견적 제안하기</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 relative">
            <span className="font-bold text-[var(--warm-rose)] bg-white px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--warm-rose)] animate-pulse" />
              대기중 {pendingRequestsCount || 0}건
            </span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--warm-rose)] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Card 3: Matched Orders */}
        <Link href="/dashboard/matched" className="group flex flex-col justify-between bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all h-64">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <MessageSquareShare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-950">매칭된 커스텀 주문</h2>
              <p className="text-sm text-indigo-900/60 mt-1">구매자가 사장님의 견적을 채택하여 성사된 주문들</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-indigo-50 pt-4">
            <span className="font-bold text-indigo-600">{matchedOrdersCount || 0}건 매칭됨</span>
            <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

      </div>
    </div>
  );
}
