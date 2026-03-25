"use client";

import { useEffect, useState } from "react";
import { saveArchive } from "@/app/actions/archiveActions";
import { Loader2, ImageIcon } from "lucide-react";

interface Archive {
  id: string;
  card_img_url: string;
  created_at: string;
  bouquet_id: string;
}

export default function ArchiveClient({
  initialArchives,
  userId,
}: {
  initialArchives: Archive[];
  userId: string;
}) {
  const [archives, setArchives] = useState<Archive[]>(initialArchives);
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
    saveArchive(parsed.bouquetId, parsed.dataUrl, userId)
      .then((res) => {
        if (res.success && res.url) {
          setArchives((prev) => [
            {
              id: Date.now().toString(),
              card_img_url: res.url!,
              created_at: new Date().toISOString(),
              bouquet_id: parsed.bouquetId,
            },
            ...prev,
          ]);
          setSaveMsg("포토카드가 아카이빙되었습니다!");
        } else {
          setSaveMsg("아카이빙 중 오류가 발생했습니다: " + res.error);
        }
      })
      .catch(() => setSaveMsg("네트워크 오류가 발생했습니다."))
      .finally(() => setIsSaving(false));
  }, [userId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-outfit text-2xl font-semibold text-[var(--color-primary)]">
          내 포토카드
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
