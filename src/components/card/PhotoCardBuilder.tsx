"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";

interface PhotoCardBuilderProps {
  bouquetId: string;
  flowerName: string;
  bouquetStory: string;
  imageUrl: string;
}

export default function PhotoCardBuilder({ bouquetId: _bouquetId, flowerName, bouquetStory, imageUrl }: PhotoCardBuilderProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCard = async () => {
    if (!cardRef.current || !photo) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFF8F5",
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.open(dataUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.download = `ONHWA_Photocard_${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("카드 생성 실패:", error);
      alert("포토카드 생성 중 문제가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKakaoShare = () => {
    const kakao = (window as any).Kakao;
    if (!kakao?.isInitialized()) {
      alert("카카오톡 공유를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    const pageUrl = window.location.href;
    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: flowerName,
        description: bouquetStory.slice(0, 80) + (bouquetStory.length > 80 ? "…" : ""),
        imageUrl: (imageUrl && !imageUrl.startsWith("data:"))
          ? imageUrl
          : "https://images.unsplash.com/photo-1490750967868-88df5691cc53?w=800&auto=format&fit=crop",
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
      },
      buttons: [
        {
          title: "꽃 이야기 보러가기",
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
      ],
    });
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
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={handleSaveCard}
            disabled={isGenerating}
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
            onClick={handleKakaoShare}
            className="unboxing-cta-btn"
          >
            🌸 이 꽃의 이야기 공유하기
          </button>
        </div>
      )}
    </div>
  );
}
