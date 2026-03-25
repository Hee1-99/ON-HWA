import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import DashboardClient from "@/components/dashboard/DashboardClient";
import LogoutButton from "@/components/LogoutButton";

import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  // 인증 확인은 쿠키 기반 클라이언트로
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // DB 조회는 admin 클라이언트로 (RLS JWT 문제 우회)
  const admin = createAdminClient();

  let displayBouquets: any[] = [];

  if (user) {
    // shops → bouquets 한 번에 조회
    const { data } = await admin
      .from('bouquets')
      .select('*, shops!inner(owner_id)')
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    displayBouquets = data ?? [];
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-outfit text-[var(--color-primary)] flex items-center gap-3">
            SHOP DASHBOARD
          </h1>
          <p className="text-gray-500 font-medium">나의 꽃다발 관리 및 판매 확정</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <LogoutButton />
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
