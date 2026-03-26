"use client";

import { useState } from "react";
import { Upload, Loader2, Sparkles, RefreshCw, Check, X, MessageCircle } from "lucide-react";
import { createBouquet } from "@/app/actions/bouquetActions";

const DEFAULT_TONE = "비격식체 (반말/해요체 섞임)";

interface Props {
  quoteDescription: string;
  quoteOccasion: string;
  onClose: () => void;
}

export default function OrderNamingPanel({ quoteDescription, quoteOccasion, onClose }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; story: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sharedLinkId, setSharedLinkId] = useState<string | null>(null);
  const triggerAI = async (base64Image: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    setSharedLinkId(null);
    try {
      const response = await fetch("/api/ai/naming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType,
          tag: quoteOccasion,
          tone: DEFAULT_TONE,
          flowers: [quoteDescription],
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
    setResult(null);
    setSharedLinkId(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Full = event.target?.result as string;
      setImage(base64Full);
      const commaIdx = base64Full.indexOf(",");
      if (commaIdx === -1) return;
      triggerAI(base64Full.slice(commaIdx + 1), base64Full.split(";")[0].split(":")[1] ?? "image/jpeg");
    };
    reader.onerror = () => setError("이미지를 읽는 중 오류가 발생했습니다.");
    reader.readAsDataURL(file);
  };

  const handleRegenerate = () => {
    if (!image) return;
    const commaIdx = image.indexOf(",");
    if (commaIdx === -1) return;
    setResult(null);
    setSharedLinkId(null);
    triggerAI(image.slice(commaIdx + 1), image.split(";")[0].split(":")[1] ?? "image/jpeg");
  };

  const handleKakaoShare = async () => {
    if (!result || !image) return;
    setIsSaving(true);
    setError(null);
    try {
      // 먼저 꽃다발 저장 → link_id 획득
      const res = await createBouquet(result.name, result.story, image);
      if (!res.success || !res.linkId) {
        setError(res.error || "저장 중 오류가 발생했습니다.");
        return;
      }
      setSharedLinkId(res.linkId);

      // 카카오 공유
      const kakao = (window as any).Kakao;
      if (!kakao?.isInitialized()) {
        alert("카카오톡 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      const shareUrl = `${window.location.origin}/flower/${res.linkId}`;
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: result.name,
          description: result.story.slice(0, 80) + (result.story.length > 80 ? "…" : ""),
          imageUrl: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop",
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
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 견적 정보 배지 */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
          상황: {quoteOccasion}
        </span>
        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
          꽃 정보: 견적서 자동 반영
        </span>
      </div>

      {/* 메인 영역: 사진 + 결과 나란히 */}
      <div className={`flex flex-col ${result ? "sm:flex-row" : ""} gap-4`}>

        {/* 사진 업로드 */}
        <label
          className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
            result ? "sm:w-2/5 aspect-square" : "w-full aspect-video"
          } ${
            image ? "border-[var(--color-primary)]" : "border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-light)]"
          } ${isLoading ? "pointer-events-none" : ""}`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} className="w-full h-full object-cover" alt="업로드된 꽃다발" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-[var(--color-secondary)] p-4">
              <Upload className="w-7 h-7" />
              <p className="font-medium text-sm text-center">완성된 꽃다발 사진 업로드</p>
              <p className="text-xs opacity-70 text-center">업로드 즉시 AI가 서사를 생성합니다</p>
            </div>
          )}
        </label>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--color-primary)] py-4">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="font-medium text-sm animate-pulse text-center">이야기를 짓는 중입니다…</p>
          </div>
        )}

        {/* 결과 */}
        {result && !isLoading && (
          <div className="flex-1 flex flex-col gap-3 animate-in fade-in duration-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">AI 네이밍 완료</span>
              </div>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> 다시 생성
              </button>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</span>
              <input
                title="꽃다발 이름"
                value={result.name}
                onChange={(e) => setResult({ ...result, name: e.target.value })}
                className="block w-full text-base font-bold text-[var(--color-primary)] bg-transparent border-none outline-none mt-0.5"
              />
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-100 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Story</span>
              <textarea
                title="꽃다발 스토리"
                value={result.story}
                onChange={(e) => setResult({ ...result, story: e.target.value })}
                className="block w-full text-xs leading-relaxed text-[#555] bg-transparent border-none outline-none mt-0.5 resize-none min-h-[80px]"
              />
            </div>

            {/* 카카오 공유 버튼 */}
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

      {/* 에러 */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}
