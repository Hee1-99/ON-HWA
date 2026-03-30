import { createAdminClient } from "@/lib/supabase/serverAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import UnboxingReveal from "./UnboxingReveal";
import PhotoCardBuilder from "@/components/card/PhotoCardBuilder";
import GiftShareSection from "./GiftShareSection";

interface Props {
  params: Promise<{ linkId: string }>;
}

export default async function RecipientCardPage({ params }: Props) {
  const { linkId } = await params;
  const admin = createAdminClient();

  const { data: bouquet } = await admin
    .from("bouquets")
    .select("id, ai_name, ai_story, original_img_url, link_id")
    .eq("link_id", linkId)
    .in("status", ["sent", "archived"])
    .single();

  if (!bouquet) notFound();

  return (
    <div className="recipient-page">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="h-header recipient-header">
        <Link href="/" className="flex items-center gap-1.5 recipient-header-logo">
          <span className="text-lg" aria-hidden>🌸</span>
          <span className="font-outfit text-base font-semibold tracking-tight">
            ON:HWA
          </span>
        </Link>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-10 flex flex-col gap-10">

        {/* ① 언박싱: blur 해제 + 타이핑 이름 + 시적 이야기 + CTA */}
        <UnboxingReveal
          bouquetName={bouquet.ai_name ?? "이름 없는 꽃다발"}
          bouquetStory={bouquet.ai_story ?? ""}
          imageUrl={bouquet.original_img_url ?? ""}
        />

        {/* ② 사진 업로드 → 포토카드 생성 + 아카이빙 */}
        <PhotoCardBuilder
          bouquetId={bouquet.id}
          flowerName={bouquet.ai_name ?? "이름 없는 꽃다발"}
        />

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="recipient-divider" />
          <span className="text-base" aria-hidden>🌷</span>
          <div className="recipient-divider" />
        </div>

        {/* ③ 카카오 선물 전달 */}
        <GiftShareSection
          linkId={linkId}
          bouquetName={bouquet.ai_name ?? "꽃다발"}
          bouquetStory={bouquet.ai_story ?? ""}
          imageUrl={bouquet.original_img_url ?? ""}
        />

      </main>

      <footer className="py-8 text-center">
        <p className="recipient-footer-text text-xs">
          © 2026 ON:HWA — 꽃의 이야기를 켜다
        </p>
      </footer>

    </div>
  );
}
