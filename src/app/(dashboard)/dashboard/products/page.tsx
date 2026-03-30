import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import DashboardClient from "@/components/dashboard/DashboardClient";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 w-min whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> 뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold font-outfit text-[var(--color-primary)] flex items-center gap-3">
            쇼케이스
          </h1>
          <p className="text-gray-500 font-medium whitespace-pre-line">
            전문 큐레이터의 시선으로 담아낸{"\n"}사장님만의 스타일 넘치는 꽃다발 포트폴리오
          </p>
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

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsData userId={user?.id} />
      </Suspense>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
      ))}
    </div>
  );
}

async function ProductsData({ userId }: { userId?: string }) {
  if (!userId) return <DashboardClient initialBouquets={[]} />;

  const admin = createAdminClient();
  const { data } = await admin
    .from("bouquets")
    .select("*, shops!inner(owner_id)")
    .eq("shops.owner_id", userId)
    .neq("status", "custom_order")
    .order("created_at", { ascending: false });

  return <DashboardClient initialBouquets={data ?? []} />;
}
