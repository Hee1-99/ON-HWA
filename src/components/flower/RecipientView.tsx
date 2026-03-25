"use client";

import { useEffect, useState } from "react";
import PhotoCardBuilder from "@/components/card/PhotoCardBuilder";

export default function RecipientView({ bouquet }: { bouquet: any }) {
  const [typedName, setTypedName] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    // 타이핑 애니메이션 로직
    const name = bouquet.ai_name || "이름 없는 꽃";
    let currentIdx = 0;
    
    // 약간의 딜레이 후 시작 (언박싱 기대감)
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setTypedName(name.substring(0, currentIdx + 1));
        currentIdx++;
        
        if (currentIdx >= name.length) {
          clearInterval(interval);
          setTimeout(() => setIsTypingComplete(true), 1000); // 깜빡임 커서를 1초 뒤 숨기거나 유지
        }
      }, 100); // 글자당 100ms
      
      return () => clearInterval(interval);
    }, 600);
    
    return () => clearTimeout(startDelay);
  }, [bouquet.ai_name]);

  // 서사 내 강조할 문구를 임의로 em 태그 처리하는 헬퍼 함수 (고객 CSS에 맞춤)
  const formatStory = (story: string) => {
    if (!story) return "";
    // 예시: 첫 문장이나 특정 키워드를 강조할 수 있지만, 우선은 줄바꿈만 정상 렌더링하도록 처리
    return story.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="max-w-md mx-auto w-full min-h-screen flex flex-col font-sans pb-20">
      
      {/* ── Unboxing reveal ────────────────────────────────────── */}
      <div className="p-4 pt-6">
        <div className="unboxing-image-wrap">
          <img 
            src={bouquet.original_img_url || 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop'} 
            alt={bouquet.ai_name} 
            className="w-full h-full object-cover"
          />
          <div className="unboxing-image-overlay" />
          
          <div className="unboxing-name-wrap">
            <span className="unboxing-name-text">
              {typedName}
            </span>
            {/* 타이핑이 끝난 후에도 여운을 위해 커서를 놔두거나 숨길 수 있음 */}
            {!isTypingComplete && <span className="unboxing-cursor" />}
          </div>
        </div>
      </div>

      {/* 시적 서사 */}
      <div className="px-4 mt-2">
        <div className="unboxing-story-section shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 [animation-fill-mode:both]">
          <div className="unboxing-story-deco text-[var(--warm-rose)]">✧</div>
          <div className="unboxing-story-body">
            {formatStory(bouquet.ai_story)}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-12 h-px bg-[var(--warm-border)] mx-auto mt-12 mb-4" />

      {/* ── Photo upload section ───────────────────────────────── */}
      <div className="px-4">
        <div className="photo-section animate-in fade-in duration-1000 delay-700 [animation-fill-mode:both]">
          <div className="photo-section-eyebrow">Digital Archive</div>
          <h2 className="photo-section-title">소중한 순간을 영원히,<br/>나만의 포토 카드</h2>
          
          {/* PhotoCardBuilder는 이전에 Tailwind로 구현해둔 것을 그대로 활용합니다. */}
          <div className="mt-4">
            <PhotoCardBuilder 
              bouquetId={bouquet.id} 
              flowerName={bouquet.ai_name} 
            />
          </div>
        </div>
      </div>

    </div>
  );
}
