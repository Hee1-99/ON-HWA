"use client";

import { useState } from "react";
import { Upload, Loader2, Sparkles, RefreshCw, Check, X, MessageCircle } from "lucide-react";
import { createBouquet } from "@/app/actions/bouquetActions";
import { saveQuoteNaming } from "@/app/actions/quoteNamingActions";

const DEFAULT_TONE = "비격식체 (반말/해요체 섞임)";

export interface SavedNaming {
  name: string;
  story: string;
  image: string | null;
}

interface Props {
  quoteId: string;
  aiFlowerRecommendation: string;
  quoteOccasion: string;
  recipientTarget: string;
  initialData?: SavedNaming;
  onClose: (saved?: SavedNaming) => void;
}

export default function OrderNamingPanel({ quoteId, aiFlowerRecommendation, quoteOccasion, recipientTarget, initialData, onClose }: Props) {
  const [image, setImage] = useState<string | null>(initialData?.image ?? null);
  const [extraNote, setExtraNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; story: string } | null>(
    initialData ? { name: initialData.name, story: initialData.story } : null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sharedLinkId, setSharedLinkId] = useState<string | null>(null);

  const handleClose = async () => {
    if (result) {
      // DB에 저장
      const res = await saveQuoteNaming(quoteId, result.name, result.story, image);
      const savedImage = (res.success && res.cardImgUrl) ? res.cardImgUrl : image;
      onClose({ name: result.name, story: result.story, image: savedImage ?? null });
    } else {
      onClose();
    }
  };

  const triggerAI = async () => {
    setIsLoading(true);
    setError(null);
    setSharedLinkId(null);
    try {
      const response = await fetch("/api/ai/naming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: quoteOccasion,
          tone: DEFAULT_TONE,
          flowers: extraNote.trim()
            ? [aiFlowerRecommendation, `추가/변경 사항: ${extraNote.trim()}`]
            : [aiFlowerRecommendation],
          recipientTarget,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI 호출 실패");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.onerror = () => setError("이미지를 읽는 중 오류가 발생했습니다.");
    reader.readAsDataURL(file);
  };

  const handleKakaoShare = async () => {
    if (!result) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await createBouquet(result.name, result.story, image ?? "", true);
      if (!res.success || !res.linkId) {
        setError(res.error || "저장 중 오류가 발생했습니다.");
        return;
      }
      setSharedLinkId(res.linkId);

      const kakao = (window as any).Kakao;
      if (!kakao?.isInitialized()) {
        alert("카카오톡 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      const shareUrl = `${window.location.origin}/flower/${res.linkId}`;
      const kakaoImageUrl = (res.imageUrl && !res.imageUrl.startsWith("data:"))
        ? res.imageUrl
        : "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop";
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: result.name,
          description: result.story.slice(0, 80) + (result.story.length > 80 ? "…" : ""),
          imageUrl: kakaoImageUrl,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [{ title: "꽃 이야기 보러가기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
      });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-indigo-900">서사 불어넣기</span>
        </div>
        <button type="button" onClick={handleClose} title="닫기" className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 주문 정보 요약 */}
      <div className="bg-white rounded-xl p-4 border border-indigo-100 flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">AI 참조 정보</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">상황: {quoteOccasion}</span>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">대상: {recipientTarget}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mt-1 border-l-2 border-indigo-200 pl-3">
          {aiFlowerRecommendation}
        </p>
      </div>

      {/* 추가/변경 입력 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
          추가 또는 변경 사항 <span className="text-gray-400 font-normal normal-case">(선택)</span>
        </label>
        <textarea
          value={extraNote}
          onChange={(e) => setExtraNote(e.target.value)}
          placeholder="예: 리시안셔스 대신 작약으로 변경, 포장지 크라프트지 사용 등"
          className="w-full bg-white border border-[var(--color-border)] rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 resize-none h-20 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      {/* 사진 업로드 (Kakao 공유용) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
          꽃다발 사진 (카카오 공유 시 사용)
        </label>
        <label className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
          image ? "border-[var(--color-primary)]" : "border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-light)]"
        }`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} className="w-full h-full object-cover" alt="꽃다발 사진" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--color-secondary)]">
              <Upload className="w-6 h-6" />
              <p className="font-medium text-sm">완성된 꽃다발 사진 업로드</p>
            </div>
          )}
        </label>
      </div>

      {/* AI 생성 트리거 */}
      {!result && !isLoading && (
        <button
          type="button"
          onClick={triggerAI}
          className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Sparkles className="w-4 h-4" /> 이야기 생성하기
        </button>
      )}

      {/* 로딩 */}
      {isLoading && (
        <div className="flex flex-col items-center py-4 gap-3 text-[var(--color-primary)]">
          <Loader2 className="w-7 h-7 animate-spin" />
          <p className="font-medium text-sm animate-pulse">주문 정보를 바탕으로 이야기를 짓는 중입니다…</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{error}</div>
      )}

      {/* 결과 */}
      {result && !isLoading && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">AI 네이밍 완료</span>
            </div>
            <button type="button" onClick={triggerAI} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
              <RefreshCw className="w-3 h-3" /> 다시 생성
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</span>
            <input
              title="꽃다발 이름"
              value={result.name}
              onChange={(e) => setResult({ ...result, name: e.target.value })}
              className="block w-full text-lg font-bold text-[var(--color-primary)] bg-transparent border-none outline-none mt-0.5"
            />
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Story</span>
            <textarea
              title="꽃다발 스토리"
              value={result.story}
              onChange={(e) => setResult({ ...result, story: e.target.value })}
              className="block w-full text-sm leading-relaxed text-[#555] bg-transparent border-none outline-none mt-0.5 resize-none min-h-[100px]"
            />
          </div>

          {!sharedLinkId ? (
            <button
              type="button"
              onClick={handleKakaoShare}
              disabled={isSaving}
              className="w-full bg-[#FEE500] text-[#000] py-3 rounded-xl font-bold text-sm hover:bg-[#FEE500]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              {isSaving ? "등록 중…" : "카카오톡으로 공유하기"}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl font-bold text-sm border border-green-200">
                <Check className="w-4 h-4" /> 등록 완료
              </div>
              <button
                type="button"
                onClick={handleKakaoShare}
                className="w-full bg-[#FEE500] text-[#000] py-2.5 rounded-xl font-bold text-sm hover:bg-[#FEE500]/90 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> 다시 공유하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
