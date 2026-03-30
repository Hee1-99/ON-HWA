"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

/* ── Kakao SDK 타입 선언 ─────────────────────────────────── */
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: KakaoShareOptions) => void;
      };
    };
  }
}

interface KakaoShareOptions {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: { mobileWebUrl: string; webUrl: string };
  };
  buttons: Array<{
    title: string;
    link: { mobileWebUrl: string; webUrl: string };
  }>;
}

/* ── Props ──────────────────────────────────────────────── */
interface GiftShareSectionProps {
  linkId: string;
  bouquetName: string;
  bouquetStory: string;
  imageUrl: string;
}

/* ── Component ──────────────────────────────────────────── */
export default function GiftShareSection({
  linkId,
  bouquetName,
  bouquetStory,
  imageUrl,
}: GiftShareSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  /* SDK는 layout.tsx의 KakaoScript가 초기화 — 여기서 중복 로드 불필요 */

  /* 펼쳐질 때 인풋 포커스 */
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isExpanded]);

  /* 미리보기 메시지 */
  const previewName = senderName.trim() || "보내시는 분";
  const previewMessage = `"${previewName}님이 당신을 위해 꽃을 준비했습니다 🌸"`;

  function triggerKakaoShare(name: string) {
    if (!window.Kakao?.Share) return;
    const pageUrl = `${window.location.origin}/card/${linkId}`;

    const options: KakaoShareOptions = {
      objectType: "feed",
      content: {
        title: `${name}님이 당신을 위해 꽃을 준비했습니다 🌸`,
        description: `${bouquetName} — ${bouquetStory.slice(0, 60)}${bouquetStory.length > 60 ? "…" : ""}`,
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
    };

    window.Kakao.Share.sendDefault(options);
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setErrorMsg("");

    if (!senderName.trim()) {
      setErrorMsg("이름을 입력해주세요.");
      inputRef.current?.focus();
      return;
    }

    startTransition(async () => {
      /* Kakao 공유는 클라이언트 전용 — DB 업데이트 없이 바로 호출 */
      triggerKakaoShare(senderName.trim());
      setDone(true);
    });
  }

  return (
    <div className="share-section-wrap">

      {/* ── 안내 문구 + 펼침 버튼 ───────────────────────────── */}
      <div className="share-section-header">
        <div className="share-section-text">
          <p className="share-section-headline">
            이 꽃의 스토리를
            <br />
            소중한 분께 전달해보세요.
          </p>
          <p className="share-section-sub">
            꽃의 이름과 이야기를 담아 카카오톡으로 보내드려요.
          </p>
        </div>

        {!done && (
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="share-expand-btn"
            // eslint-disable-next-line jsx-a11y/aria-proptypes
            aria-expanded={isExpanded}
          >
            <span>선물 전달하기</span>
            <ChevronDown
              className={`share-expand-icon ${isExpanded ? "share-expand-icon--open" : "share-expand-icon--closed"}`}
            />
          </button>
        )}
      </div>

      {/* ── 인라인 펼침 폼 ──────────────────────────────────── */}
      <div
        className={`share-form-wrap ${isExpanded && !done ? "share-form-wrap--open" : "share-form-wrap--closed"}`}
      >
        <form onSubmit={handleSubmit} className="share-form" noValidate>

          {/* 메시지 미리보기 */}
          <div className="share-preview">
            <p className="share-preview-label">전달될 메시지 미리보기</p>
            <p className="share-preview-msg">{previewMessage}</p>
          </div>

          {/* 이름 입력 */}
          <div className="share-field">
            <label htmlFor="sender-name" className="share-label">
              꽃을 보내시는 분의 이름
            </label>
            <input
              ref={inputRef}
              id="sender-name"
              type="text"
              value={senderName}
              onChange={(e) => { setSenderName(e.target.value); setErrorMsg(""); }}
              placeholder="예) 홍길동"
              autoComplete="name"
              className="warm-input"
            />
            {errorMsg && (
              <p className="share-error">{errorMsg}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isPending}
            className="share-submit-btn"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> 잠시만요…</>
            ) : (
              <>
                <KakaoIcon />
                카카오톡으로 선물하기
              </>
            )}
          </button>

        </form>
      </div>

      {/* ── 전달 완료 상태 ──────────────────────────────────── */}
      {done && (
        <div className="share-done-wrap">
          <p className="share-done-emoji" aria-hidden>🌸</p>
          <p className="share-done-title">전달이 완료됐어요</p>
          <p className="share-done-sub">
            카카오톡 공유 창을 확인해주세요.
          </p>
          <button
            type="button"
            onClick={() => { setDone(false); setSenderName(""); setIsExpanded(false); }}
            className="share-done-reset"
          >
            다시 보내기
          </button>
        </div>
      )}

    </div>
  );
}

/* ── 카카오 아이콘 (SVG) ─────────────────────────────────── */
function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.718 1.607 5.112 4.04 6.562l-1.03 3.78c-.09.33.28.6.57.41L9.9 19.14A11.26 11.26 0 0 0 12 19.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
    </svg>
  );
}
