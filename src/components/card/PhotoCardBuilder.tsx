"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { Download, Loader2, Image as ImageIcon, Archive, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveArchiveRecord } from "@/app/actions/archiveActions";

// 카드 내 사진 영역 비율 (3:4 카드, padding 16px, 로고 60px 제외)
const PHOTO_W = 352;
const PHOTO_H = 420;

interface PhotoCardBuilderProps {
  bouquetId: string;
  flowerName: string;
}

/** 업로드된 이미지를 카드 사진 영역 비율로 미리 크롭 — object-fit 없이도 꽉 채워짐 */
function cropToCardRatio(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_W;
      canvas.height = PHOTO_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas context unavailable")); return; }

      // object-fit: cover 동작 재현
      const scale = Math.max(PHOTO_W / img.naturalWidth, PHOTO_H / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const dx = (PHOTO_W - sw) / 2;
      const dy = (PHOTO_H - sh) / 2;
      ctx.drawImage(img, dx, dy, sw, sh);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export default function PhotoCardBuilder({ bouquetId, flowerName }: PhotoCardBuilderProps) {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState<string | null>(null);
  const [iosSaveUrl, setIosSaveUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const cropped = await cropToCardRatio(file);
      setPhoto(cropped);
    } catch {
      // 크롭 실패 시 원본 사용
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
      backgroundColor: "#FFFFFF",
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

      const blobUrl = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS: 팝업 대신 페이지 내 오버레이로 이미지 표시 → 길게 눌러 저장
        setIosSaveUrl(blobUrl);
      } else {
        // Android / 데스크톱: anchor download → 갤러리/다운로드 폴더 직접 저장
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
        sessionStorage.setItem("pendingArchive", JSON.stringify({ dataUrl, bouquetId }));
        router.push("/login?from=archive");
        return;
      }

      const fileName = `${bouquetId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("archives")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

      if (uploadError) throw new Error("Storage 업로드 실패: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("archives")
        .getPublicUrl(fileName);

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
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date());

  return (
    <>
      <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">

        {/* 캔버스 — html2canvas 캡처 영역 */}
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
              {isGenerating
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Download className="w-5 h-5" /> 내 폰에 저장</>}
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving || isGenerating}
              className="w-full bg-[var(--warm-rose)] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
            >
              {isArchiving
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Archive className="w-5 h-5" /> 포토카드 아카이빙 하기</>}
            </button>
          </div>
        )}
      </div>

      {/* iOS 저장 오버레이 — 팝업 없이 페이지 내에서 이미지 표시 */}
      {iosSaveUrl && (
        <div className="pc-ios-overlay" onClick={() => { URL.revokeObjectURL(iosSaveUrl); setIosSaveUrl(null); }}>
          <div className="pc-ios-modal" onClick={e => e.stopPropagation()}>
            <p className="pc-ios-hint">이미지를 <strong>길게 눌러</strong> 사진 보관함에 저장하세요</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iosSaveUrl} alt="저장할 포토카드" className="pc-ios-img" />
            <button
              type="button"
              className="pc-ios-close"
              onClick={() => { URL.revokeObjectURL(iosSaveUrl); setIosSaveUrl(null); }}
            >
              <X className="w-4 h-4" /> 닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
