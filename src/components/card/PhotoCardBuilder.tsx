"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { saveArchive } from "@/app/actions/archiveActions";

interface PhotoCardBuilderProps {
  bouquetId: string;
  flowerName: string;
}

export default function PhotoCardBuilder({ bouquetId, flowerName }: PhotoCardBuilderProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCard = async () => {
    if (!cardRef.current || !photo) return;
    setIsGenerating(true);

    try {
      // 1. Generate Image with html2canvas (scale 2 for retina qual)
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2,
        useCORS: true, 
        backgroundColor: "#FFF8F5" 
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // 2. Trigger Device Download
      const link = document.createElement("a");
      link.download = `ONHWA_Photocard_${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      link.click();

      // 3. Visitor ID 처리 (로컬 스토리지)
      let visitorId = localStorage.getItem("onhwa_visitor_id");
      if (!visitorId) {
        visitorId = "visitor_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem("onhwa_visitor_id", visitorId);
      }

      // 4. Save to Supabase DB
      const result = await saveArchive(bouquetId, dataUrl, visitorId);
      if (result.success) {
        alert("나의 꽃 보관함에 저장되었습니다 🌸");
      } else {
        alert("기기 저장엔 성공했으나, 서버 기록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("카드 생성 실패:", error);
      alert("포토카드 생성 중 문제가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Intl.DateTimeFormat('ko-KR', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date());

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      
      {/* 캔버스 (html2canvas 캡처 영역) */}
      <div 
        ref={cardRef}
        className="w-full aspect-[3/4] bg-[var(--warm-card)] rounded-[24px] shadow-xl border border-[var(--warm-border)] p-4 flex flex-col items-center relative overflow-hidden"
      >
        {/* 사진 영역 */}
        <div className="w-full flex-1 rounded-[16px] bg-gray-100 overflow-hidden relative shadow-inner group">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Uploaded" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--warm-muted)] bg-gray-50 border-2 border-dashed border-gray-200 m-2 rounded-xl">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-bold opacity-70">여기를 눌러 추억 업로드</p>
            </div>
          )}
          
          {/* 숨겨진 실제 input */}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Upload Photo"
          />

          {/* 오버레이 (안개처럼 아래부터 깔리는 그라데이션) */}
          {photo && (
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#4A2E2B]/80 to-transparent pointer-events-none" />
          )}

          {/* 사진 위 감성 텍스트 오버레이 */}
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

      {/* 액션 버튼 */}
      {photo && (
        <button
          onClick={handleSaveCard}
          disabled={isGenerating}
          className="w-full bg-[var(--warm-text)] text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Download className="w-5 h-5" /> 내 폰에 저장 및 아카이빙
            </>
          )}
        </button>
      )}
    </div>
  );
}
