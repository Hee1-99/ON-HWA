"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { Download, Loader2, Image as ImageIcon, Archive } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveArchiveRecord } from "@/app/actions/archiveActions";

interface PhotoCardBuilderProps {
  bouquetId: string;
  flowerName: string;
}

export default function PhotoCardBuilder({ bouquetId, flowerName }: PhotoCardBuilderProps) {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateCardBlob = async (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    if (!cardRef.current || !photo) return null;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFF8F5",
      logging: false,
    });
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { blob, dataUrl };
  };

  const handleSaveCard = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCardBlob();
      if (!result) return;
      const { dataUrl } = result;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.open(dataUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.download = `ONHWA_Photocard_${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error: any) {
      console.error("카드 생성 실패:", error);
      alert("포토카드 생성 중 문제가 발생했습니다: " + (error?.message ?? error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    setArchiveMsg(null);
    try {
      const result = await generateCardBlob();
      if (!result) { setIsArchiving(false); return; }
      const { blob, dataUrl } = result;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.user_metadata?.role !== "general") {
        // 비로그인 → sessionStorage에 dataUrl 저장 후 로그인 페이지로
        sessionStorage.setItem("pendingArchive", JSON.stringify({ dataUrl, bouquetId }));
        router.push("/login?from=archive");
        return;
      }

      // 클라이언트에서 직접 Supabase Storage에 업로드
      const fileName = `${bouquetId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("archives")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

      if (uploadError) throw new Error("Storage 업로드 실패: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("archives")
        .getPublicUrl(fileName);

      // URL만 서버 액션으로 DB에 저장
      const dbResult = await saveArchiveRecord(bouquetId, publicUrl, user.id);
      if (!dbResult.success) throw new Error("DB 저장 실패: " + dbResult.error);

      setArchiveMsg("포토카드가 아카이빙되었습니다! 내 아카이브에서 확인하세요.");
    } catch (error: any) {
      console.error("아카이빙 실패:", error);
      setArchiveMsg("아카이빙 실패: " + (error?.message ?? "알 수 없는 오류"));
    } finally {
      setIsArchiving(false);
    }
  };

  const today = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">

      {/* 캔버스 (html2canvas 캡처 영역) */}
      <div
        ref={cardRef}
        className="w-full aspect-[3/4] bg-[var(--warm-card)] rounded-[24px] shadow-xl border border-[var(--warm-border)] p-4 flex flex-col items-center relative overflow-hidden"
      >
        {/* 사진 영역 */}
        <div className="w-full flex-1 rounded-[16px] bg-gray-100 overflow-hidden relative shadow-inner">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Uploaded" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--warm-muted)] bg-gray-50 border-2 border-dashed border-gray-200 m-2 rounded-xl">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-bold opacity-70">여기를 눌러 추억 업로드</p>
            </div>
          )}

          {/* 숨겨진 파일 input */}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Upload Photo"
          />

          {/* 하단 그라데이션 오버레이 */}
          {photo && (
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#4A2E2B]/80 to-transparent pointer-events-none" />
          )}

          {/* 사진 위 텍스트 */}
          {photo && (
            <div className="absolute bottom-4 left-5 right-5 flex flex-col z-20 pointer-events-none">
              <h2 className="text-white font-outfit font-bold text-2xl tracking-wide drop-shadow-md mb-1 break-keep">
                {flowerName}
              </h2>
              <p className="text-white/90 text-sm font-medium drop-shadow uppercase tracking-widest">
                {today}
              </p>
            </div>
          )}
        </div>

        {/* 하단 로고 */}
        <div className="h-14 flex items-center justify-center w-full pt-1 shrink-0">
          <span className="font-outfit font-bold text-[var(--warm-text)] text-lg tracking-[0.2em]">
            ON:HWA
          </span>
        </div>
      </div>

      {/* 결과 메시지 */}
      {archiveMsg && (
        <p className={`text-sm text-center font-medium px-4 py-2 rounded-lg w-full ${
          archiveMsg.includes("실패")
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {archiveMsg}
        </p>
      )}

      {/* 액션 버튼 */}
      {photo && (
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={handleSaveCard}
            disabled={isGenerating || isArchiving}
            className="w-full bg-[var(--warm-text)] text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Download className="w-5 h-5" /> 내 폰에 저장</>
            )}
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving || isGenerating}
            className="w-full bg-[var(--warm-rose)] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isArchiving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Archive className="w-5 h-5" /> 포토카드 아카이빙 하기</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
