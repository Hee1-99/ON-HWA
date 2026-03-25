"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, Sparkles, Image as ImageIcon, Tag, RefreshCw, MessageCircleHeart, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBouquet } from "@/app/actions/bouquetActions";

const SITUATION_TAGS = [
  "생일", "고백", "졸업/새출발", "일상/감사", 
  "위로", "기념일", "응원", "이별"
];

const FLOWER_CATEGORIES = [
  {
    category: "메인 꽃",
    options: ["장미", "작약", "라넌큘러스", "수국", "튤립", "거베라", "해바라기", "카네이션", "리시안셔스(유스토마)", "글라디올러스", "극락조화(스트렐리치아)", "안스리움", "아이리스", "다알리아", "모란", "아네모네"]
  },
  {
    category: "서브 꽃",
    options: ["프리지아", "알스트로메리아", "스위트피", "스카비오사", "델피니움", "버베나", "스토크", "리나리아", "금어초", "국화(스프레이)", "팬지", "라벤더", "캄파눌라", "트라켈리움"]
  },
  {
    category: "그린류",
    options: ["유칼립투스", "루스커스", "레더리프", "아이비", "피토니아", "아스파라거스 펀", "스틸그라스", "몬스테라", "버드나무(윌로우)", "레몬리프", "갈락스", "피어리스", "방울토마토 줄기", "타스마니안(은엽)"]
  },
  {
    category: "가지·열매",
    options: ["면화(코튼)", "유칼립투스 열매", "산딸나무 가지", "조팝나무", "미모사", "솔방울", "열매 고리버들", "벚나무 가지", "홍가시 가지", "은방울꽃 가지"]
  }
];

const TONES = [
  "비격식체 (반말/해요체 섞임)",
  "격식체 (존댓말/하십시오체)"
];


export default function BouquetUploader() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>(SITUATION_TAGS[0]);
  const [selectedTone, setSelectedTone] = useState<string>(TONES[0]);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; story: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setResult(null);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setImage(base64Data);
    };
    reader.onerror = () => {
      setError("이미지를 읽는 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  const triggerAI = async (base64Image: string, mimeType: string, tag: string, tone: string, flowers: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/naming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, mimeType, tag, tone, flowers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI 호출 실패");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!image) return;
    const commaIdx = image.indexOf(",");
    if (commaIdx === -1) return;
    const base64Data = image.slice(commaIdx + 1);
    const mimeType = image.split(";")[0].split(":")[1] ?? "image/jpeg";
    await triggerAI(base64Data, mimeType, selectedTag, selectedTone, selectedFlowers);
  };

  const toggleFlower = (flower: string) => {
    if (selectedFlowers.includes(flower)) {
      setSelectedFlowers(prev => prev.filter(f => f !== flower));
    } else {
      setSelectedFlowers(prev => [...prev, flower]);
    }
  };

  const handleSave = async () => {
    if (!result || !image) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await createBouquet(result.name, result.story, image);
      if (res.success) {
        alert("꽃다발이 성공적으로 등록되었습니다!");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "꽃다발 저장 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-[var(--color-border)]">
      
      {/* Options Area */}
      <div className="flex flex-col gap-6">

        {/* Flower Selection Dropdown */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> (선택) 꽃 & 그린 종류
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full text-left bg-white border border-[var(--color-border)] rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            >
              {selectedFlowers.length > 0 
                ? <span className="text-[var(--color-primary)]">{selectedFlowers.join(", ")}</span>
                : <span className="text-gray-400">포함된 꽃과 식물을 선택해주세요</span>
              }
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[var(--color-border)] shadow-xl rounded-xl z-20 max-h-80 overflow-y-auto p-4 flex flex-col gap-6">
                {FLOWER_CATEGORIES.map((group) => (
                  <div key={group.category} className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">{group.category}</span>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((flower) => {
                        const isSelected = selectedFlowers.includes(flower);
                        return (
                          <button
                            type="button"
                            key={flower}
                            onClick={() => toggleFlower(flower)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                              isSelected 
                                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {flower}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* 닫기 (축소) 버튼 */}
                <div className="sticky bottom-0 pt-4 bg-white/95 backdrop-blur-sm -mx-2 px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full bg-[#111] text-white font-bold text-sm py-3 rounded-xl shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> 선택 완료
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Tags */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
              <Tag className="w-4 h-4" /> 증정 상황
            </label>
            <div className="flex flex-wrap gap-2">
              {SITUATION_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    selectedTag === tag 
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm" 
                      : "bg-white text-[var(--color-secondary)] border-[var(--color-border)] hover:border-gray-400 hover:text-[var(--color-primary)]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tones Area */}
          <div className="flex flex-col gap-2 sm:w-1/3">
            <label className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
              <MessageCircleHeart className="w-4 h-4" /> 서사 문체
            </label>
            <div className="flex flex-col gap-2">
              {TONES.map((tone) => (
                <button
                  type="button"
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm text-center sm:text-left font-medium transition-all duration-200 border ${
                    selectedTone === tone 
                      ? "bg-black text-white border-black shadow-sm" 
                      : "bg-gray-50 text-[var(--color-secondary)] border-transparent hover:bg-gray-100"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
          image ? "border-[var(--color-primary)] bg-[var(--color-bg-light)]" : "border-[var(--color-border)] hover:bg-[var(--color-bg-light)]"
        }`}
      >
        <input 
          type="file" 
          title="꽃 사진 업로드"
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} className="w-full h-full object-contain rounded-xl p-2" alt="Uploaded bouquet" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-[var(--color-secondary)]">
            <Upload className="w-8 h-8" />
            <p className="font-medium">클릭하여 꽃 사진 업로드</p>
            <p className="text-xs">또는 이미지를 여기로 드래그 하세요</p>
          </div>
        )}
      </div>

      {/* Manual Trigger Button */}
      {image && !result && !isLoading && (
        <button
          type="button"
          onClick={() => {
            const commaIdx = image.indexOf(",");
            if (commaIdx === -1) return;
            const base64Data = image.slice(commaIdx + 1);
            const mimeType = image.split(";")[0].split(":")[1] ?? "image/jpeg";
            triggerAI(base64Data, mimeType, selectedTag, selectedTone, selectedFlowers);
          }}
          className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold font-outfit text-lg hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-md animate-in fade-in"
        >
          <Sparkles className="w-5 h-5" />
          이야기 불어넣기
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-[var(--color-primary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="font-outfit font-medium animate-pulse">상황에 맞는 따뜻한 이야기를 짓는 중입니다...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
          {error}
        </div>
      )}

      {/* Result Area */}
      {result && (
        <div className="flex flex-col gap-4 p-6 bg-[var(--color-accent-light)] rounded-xl border border-[var(--color-accent)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 pb-3 border-b border-[var(--color-accent)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="font-outfit font-bold text-lg text-[var(--color-primary)]">AI 네이밍 완료</h3>
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-white text-[var(--color-primary)] font-semibold text-sm rounded-lg border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-bg-light)] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              새로운 이야기 불어넣기
            </button>
          </div>
          
          <div className="flex flex-col gap-1 bg-white p-5 rounded-lg border border-white/50 shadow-sm focus-within:border-[var(--color-primary)] transition-colors">
            <span className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-1">Name (직접 수정 가능)</span>
            <input 
              title="꽃다발 이름"
              placeholder="이름 입력"
              value={result.name}
              onChange={(e) => setResult({ ...result, name: e.target.value })}
              className="text-2xl font-bold text-[var(--color-primary)] bg-transparent border-none outline-none w-full"
            />
          </div>
          
          <div className="flex flex-col gap-1 bg-white p-5 rounded-lg border border-white/50 shadow-sm focus-within:border-[var(--color-primary)] transition-colors">
            <span className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-1">Story (직접 수정 가능)</span>
            <textarea 
              title="꽃다발 스토리"
              placeholder="스토리 입력"
              value={result.story}
              onChange={(e) => setResult({ ...result, story: e.target.value })}
              className="text-sm leading-relaxed text-[#444] bg-transparent border-none outline-none w-full resize-none min-h-[100px]"
            />
          </div>

          {/* 최종 저장 버튼 */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-4 w-full py-4 bg-[#111] text-white rounded-xl font-bold font-outfit text-[1.05rem] hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-lg disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            꽃다발 등록하기
          </button>
        </div>
      )}
    </div>
  );
}
