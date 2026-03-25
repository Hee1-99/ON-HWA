import { createAdminClient } from "@/lib/supabase/serverAdmin";
import { notFound } from "next/navigation";
import RecipientView from "@/components/flower/RecipientView";

interface RecipientPageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export default async function FlowerRecipientPage({ params }: RecipientPageProps) {
  const { linkId } = await params;

  // 관리자 권한 클라이언트로 데이터 조회 (수령인은 비로그인 상태이므로 RLS 우회 필요)
  const admin = createAdminClient();

  const { data: bouquet, error } = await admin
    .from("bouquets")
    .select("*")
    .eq("link_id", linkId)
    .single();

  if (error || !bouquet) {
    console.error("Failed to load bouquet:", error);
    notFound(); 
  }

  // 상태가 draft이거나 다른 비공개 상태일 때의 방어 로직 (필요시 추가)
  // if (bouquet.status === 'draft') return <div>아직 준비 중인 꽃다발입니다.</div>;

  return (
    <div className="w-full min-h-screen bg-[#FFFDFB] text-[#191919]">
      <RecipientView bouquet={bouquet} />
    </div>
  );
}
