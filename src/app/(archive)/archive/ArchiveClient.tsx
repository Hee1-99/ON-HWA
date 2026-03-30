"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveArchiveRecord } from "@/app/actions/archiveActions";
import { Loader2, ImageIcon, Plus } from "lucide-react";
import Link from "next/link";

interface Archive {
  id: string;
  card_img_url: string;
  created_at: string;
  bouquet_id: string;
}

interface CustomRequest {
  id: string;
  occasion: string;
  recipient_target: string;
  status: string;
  created_at: string;
}

export default function ArchiveClient({
  initialArchives,
  myRequests,
  userId,
}: {
  initialArchives: Archive[];
  myRequests: CustomRequest[];
  userId: string;
}) {
  const [archives, setArchives] = useState<Archive[]>(initialArchives);
  const [requests] = useState<CustomRequest[]>(myRequests);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingArchive");
    if (!pending) return;
    sessionStorage.removeItem("pendingArchive");

    let parsed: { dataUrl: string; bouquetId: string };
    try {
      parsed = JSON.parse(pending);
    } catch {
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const fileName = `${parsed.bouquetId}/${Date.now()}.jpg`;

    fetch(parsed.dataUrl)
      .then((r) => r.blob())
      .then(async (blob) => {
        const { error: uploadError } = await supabase.storage
          .from("archives")
          .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });
        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from("archives")
          .getPublicUrl(fileName);

        const result = await saveArchiveRecord(parsed.bouquetId, publicUrl, userId);
        if (!result.success) throw new Error(result.error ?? "DB 저장 실패");

        setArchives((prev) => [
          {
            id: Date.now().toString(),
            card_img_url: publicUrl,
            created_at: new Date().toISOString(),
            bouquet_id: parsed.bouquetId,
          },
          ...prev,
        ]);
        setSaveMsg("포토카드가 아카이빙되었습니다!");
      })
      .catch((e: Error) => setSaveMsg("아카이빙 중 오류가 발생했습니다: " + e.message))
      .finally(() => setIsSaving(false));
  }, [userId]);

  return (
    <div className="flex flex-col gap-6">
      {/* Action Banner */}
      <div className="w-full bg-[var(--color-primary)] text-white rounded-2xl p-6 sm:p-8 flex items-center justify-between shadow-md mb-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-outfit text-xl sm:text-2xl font-semibold">새로운 꽃다발이 필요한가요?</h2>
          <p className="text-sm opacity-80">AI 큐레이터가 개인 맞춤형 꽃 구성을 추천드립니다.</p>
        </div>
        <Link 
          href="/archive/new-order" 
          className="flex items-center gap-2 bg-[var(--warm-rose)] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> 맞춤 주문하기
        </Link>
      </div>

      {requests.length > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between">
            <h1 className="font-outfit text-2xl font-semibold text-[var(--color-primary)]">내 맞춤 주문</h1>
            <span className="text-sm text-[var(--color-secondary)]">{requests.length}건</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => {
              const statusLabel = 
                req.status === "pending" ? "요청됨 (견적 대기중)" :
                req.status === "quoting" ? "사장님 참여 중 (견적 도착)" :
                req.status === "awarded" || req.status === "completed" ? "매칭 완료!" : "종료됨";
              
              const isAwarded = req.status === "awarded" || req.status === "completed";

              return (
                <Link
                  href={`/archive/orders/${req.id}`}
                  key={req.id}
                  className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md ${
                    isAwarded ? "bg-[var(--warm-rose)]/5 border-[var(--warm-rose)]/20" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isAwarded ? "bg-[var(--warm-rose)] text-white" : "bg-indigo-50 text-indigo-700"}`}>{statusLabel}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500 font-bold">{req.recipient_target} 님에게</p>
                    <p className="font-medium text-[var(--color-primary)] truncate">{req.occasion}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <h1 className="font-outfit text-2xl font-semibold text-[var(--color-primary)]">
          내 포토카드 아카이브
        </h1>
        <span className="text-sm text-[var(--color-secondary)]">{archives.length}장</span>
      </div>

      {isSaving && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          포토카드를 아카이빙하는 중입니다…
        </div>
      )}

      {saveMsg && !isSaving && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${
          saveMsg.includes("오류")
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-green-50 border-green-200 text-green-700"
        }`}>
          {saveMsg}
        </div>
      )}

      {archives.length === 0 && !isSaving ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--color-secondary)]">
          <ImageIcon className="w-12 h-12 opacity-30" />
          <p className="font-medium">아직 아카이빙된 포토카드가 없습니다.</p>
          <p className="text-sm opacity-70">받은 꽃의 포토카드를 여기에 보관하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {archives.map((a) => (
            <div
              key={a.id}
              className="aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.card_img_url}
                alt="포토카드"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
