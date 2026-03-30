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
      const { blob } = result;

      // 데이터 URL 대신 Blob URL 사용 — 모바일에서 빈 페이지 방지
      const blobUrl = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS: 새 탭에서 이미지 열기 → 길게 눌러 사진 저장
        const tab = window.open(blobUrl, "_blank");
        if (!tab) {
          // 팝업 차단된 경우 같은 탭에서 열기
          window.location.href = blobUrl;
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      } else {
        // Android / 데스크톱: anchor download
        const link = document.createElement("a");
        link.download = `ONHWA_Photocard_${Date.now()}.jpg`;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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

      {/* 캔버스 — html2canvas 캡처 영역. 색상은 globals.css .pc-* 클래스로 hex 고정 */}
      <div ref={cardRef} className="pc-canvas">
        <div className="pc-photo-area">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Uploaded" />
          ) : (
            <div className="pc-empty-placeholder">
              <ImageIcon width={32} height={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p>여기를 눌러 추억 업로드</p>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="pc-file-input"
            title="Upload Photo"
          />

          {photo && <div className="pc-gradient-overlay" />}

          {photo && (
            <div className="pc-text-overlay">
              <h2 className="pc-flower-name">{flowerName}</h2>
              <p className="pc-date">{today}</p>
            </div>
          )}
        </div>

        <div className="pc-logo-bar">
          <span className="pc-logo-text">ON:HWA</span>
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
