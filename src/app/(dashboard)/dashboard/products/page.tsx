import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import DashboardClient from "@/components/dashboard/DashboardClient";

import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();

  let displayBouquets: any[] = [];

  if (user) {
    const { data } = await admin
      .from('bouquets')
      .select('*, shops!inner(owner_id)')
      .eq('shops.owner_id', user.id)
      .neq('status', 'custom_order')
      .order('created_at', { ascending: false });

    displayBouquets = data ?? [];
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 w-min whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> 뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold font-outfit text-[var(--color-primary)] flex items-center gap-3">
            판매중인 상품 관리
          </h1>
          <p className="text-gray-500 font-medium">나의 꽃다발 큐레이션 및 판매 상태 변경</p>
        </div>
        <div className="flex items-end gap-3">
          <Link 
            href="/bouquets/new" 
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5" />
            새 꽃다발 등록하기
          </Link>
        </div>
      </div>
      
      <DashboardClient initialBouquets={displayBouquets} />

    </div>
  );
}
