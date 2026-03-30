"use client";

import { useState } from "react";
import { deleteBouquets } from "@/app/actions/bouquetActions";
import { CheckCircle, Gift, Loader2, Trash2 } from "lucide-react";

/**
 * 사장님 쇼케이스(포트폴리오) 클라이언트 컴포넌트
 * - 등록된 꽃다발 목록 표시 및 삭제 기능만 제공 (판매 프로세스 제외)
 */
export default function DashboardClient({ initialBouquets }: { initialBouquets: any[] }) {
  const [bouquets, setBouquets] = useState(initialBouquets);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 선택 모드 상태 (삭제용)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  if (bouquets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
        <p className="text-gray-500 font-medium text-lg">아직 등록된 포트폴리오가 없습니다.</p>
        <p className="text-sm text-gray-400 mt-2">새로운 꽃다발을 등록해 사장님의 스타일을 뽐내보세요.</p>
      </div>
    );
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`정말로 ${selectedIds.length}개의 포트폴리오 항목을 삭제하시겠습니까?`)) return;

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const res = await deleteBouquets(selectedIds);
      if (res.success) {
        setBouquets((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
        setSelectedIds([]);
        setIsSelectMode(false);
      } else {
        setErrorMsg(res.error || "삭제 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setErrorMsg("네트워크 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-200 shadow-sm">
          🚨 {errorMsg}
        </div>
      )}

      {/* 컨트롤 바: 개수 및 삭제 작업 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">전체</span>
          <span className="bg-gray-100 text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-bold shadow-inner">
            {bouquets.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <>
              <button
                onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                취소
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0 || isDeleting}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {selectedIds.length}개 삭제하기
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-2 hover:border-gray-300"
            >
              <CheckCircle className="w-4 h-4" /> 선택 편집
            </button>
          )}
        </div>
      </div>

      {/* 리스트 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bouquets.map((b) => {
          const isSelected = selectedIds.includes(b.id);

          return (
            <div 
              key={b.id} 
              onClick={() => isSelectMode ? toggleSelection(b.id) : undefined}
              className={`flex flex-col bg-white rounded-3xl border overflow-hidden transition-all group relative ${
                isSelectMode ? "cursor-pointer" : ""
              } ${
                isSelected ? "border-red-500 ring-4 ring-red-100" : "border-gray-100 hover:border-[var(--color-primary)] hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {/* 선택 모드 시 체크박스 오버레이 */}
              {isSelectMode && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center p-0.5 border border-gray-100">
                  {isSelected ? (
                    <CheckCircle className="w-8 h-8 text-red-500 fill-red-50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200" />
                  )}
                </div>
              )}

              {/* 이미지 영역 */}
              <div className="relative aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden">
                {b.original_img_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.original_img_url} alt={b.ai_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Gift className="w-12 h-12 text-gray-200" />
                )}
                
                {/* 그라데이션 오버레이 (텍스트 가독성용) */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* 텍스트 정보 */}
              <div className="p-6 flex flex-col flex-1 gap-2">
                <h3 className="font-bold text-xl text-[var(--color-primary)] font-outfit truncate group-hover:text-black transition-colors">
                  {b.ai_name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {b.ai_story}
                </p>
                
                {/* 등록일 표시 */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  {!isSelectMode && (
                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Gift className="w-3 h-3 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
