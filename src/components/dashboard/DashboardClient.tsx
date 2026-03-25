"use client";

import { useState } from "react";
import { confirmSale, deleteBouquets } from "@/app/actions/bouquetActions";
import { CheckCircle, Phone, Lock, Gift, Loader2, MessageCircle, Trash2, CheckSquare, Square } from "lucide-react";

export default function DashboardClient({ initialBouquets }: { initialBouquets: any[] }) {
  const [bouquets, setBouquets] = useState(initialBouquets);
  const [phoneInputs, setPhoneInputs] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'selling' | 'sold'>('all');

  // Select Mode State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmSale = async (id: string) => {
    const phone = phoneInputs[id];
    if (!phone || phone.trim() === "") {
      setErrorMsg("구매자 전화번호를 입력해주세요.");
      return;
    }

    setErrorMsg(null);
    setLoadingId(id);

    try {
      const res = await confirmSale(id, phone);
      if (res.success) {
        // Optimistic UI update
        setBouquets((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, status: 'sent', recipient_phone: phone } : b
          )
        );
      } else {
        setErrorMsg(res.error || "판매 확정 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setErrorMsg("네트워크 오류가 발생했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  const shareToKakao = (b: any) => {
    const kakao = (window as any).Kakao;
    if (typeof window === 'undefined' || !kakao || !kakao.isInitialized()) {
      alert("카카오톡 기능을 로드하는 중이거나, KAKAO_JS_KEY가 설정되지 않았습니다.");
      return;
    }

    const shareUrl = `${window.location.origin}/flower/${b.link_id}`;
    console.log('[Kakao Share] URL:', shareUrl);

    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: b.ai_name,
        description: b.ai_story,
        imageUrl: (b.original_img_url && !b.original_img_url.startsWith('data:')) 
          ? b.original_img_url 
          : 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop',
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '꽃 구경하기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };
  if (bouquets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium text-lg">아직 등록된 꽃다발이 없습니다.</p>
      </div>
    );
  }

  const filteredBouquets = bouquets.filter((b) => {
    const isSoldOut = b.status === "sent" || b.status === "archived";
    if (filter === 'selling') return !isSoldOut;
    if (filter === 'sold') return isSoldOut;
    return true;
  });

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`정말로 ${selectedIds.length}개의 꽃다발을 삭제하시겠습니까?`)) return;

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
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-200">
          🚨 {errorMsg}
        </div>
      )}

      {/* Control Bar: Filters & Delete Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-gray-100/80 w-fit rounded-xl border border-gray-200 shadow-inner">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          전체 보기
        </button>
        <button
          onClick={() => setFilter('selling')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'selling' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          판매 중
        </button>
        <button
          onClick={() => setFilter('sold')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'sold' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          판매 완료
        </button>
      </div>

      {/* Delete Controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {isSelectMode ? (
          <>
            <button
              onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              취소
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || isDeleting}
              className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {selectedIds.length}개 삭제하기
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsSelectMode(true)}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> 선택 삭제
          </button>
        )}
      </div>
      </div>

      {filteredBouquets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium text-lg">해당 조건의 꽃다발이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBouquets.map((b) => {
          const isSoldOut = b.status === "sent" || b.status === "archived";
          const isLoading = loadingId === b.id;
          const isSelected = selectedIds.includes(b.id);

          return (
            <div 
              key={b.id} 
              onClick={() => isSelectMode ? toggleSelection(b.id) : undefined}
              className={`flex flex-col bg-white rounded-2xl border overflow-hidden transition-all shadow-sm relative ${
                isSelectMode ? "cursor-pointer" : ""
              } ${
                isSelected ? "border-red-500 ring-4 ring-red-100" : isSoldOut ? "border-gray-200 opacity-80" : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md"
              }`}
            >
              {/* Checkbox Overlay in Select Mode */}
              {isSelectMode && (
                <div className="absolute top-4 left-4 z-10 bg-white shadow-sm rounded-full flex items-center justify-center p-0.5 pointer-events-none">
                  {isSelected ? (
                    <CheckCircle className="w-8 h-8 text-red-500 fill-red-50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white/80" />
                  )}
                </div>
              )}

              {/* Image & Header */}
              <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {b.original_img_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.original_img_url} alt={b.ai_name} className="w-full h-full object-cover" />
                ) : (
                  <Gift className="w-12 h-12 text-gray-300" />
                )}
                
                {/* Sold Out Badge */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white px-6 py-2 rounded-full font-bold text-lg text-red-600 shadow-xl flex items-center gap-2 transform -rotate-12 border-2 border-red-600">
                      <Lock className="w-5 h-5" /> SOLD OUT
                    </div>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[var(--color-primary)] mb-1">{b.ai_name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{b.ai_story}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                      <Phone className="w-3 h-3" /> 구매자 전화번호
                    </label>
                    <input 
                      type="text" 
                      placeholder="010-0000-0000" 
                      value={isSoldOut ? (b.recipient_phone || "") : (phoneInputs[b.id] || "")}
                      onChange={(e) => setPhoneInputs({...phoneInputs, [b.id]: e.target.value})}
                      readOnly={isSoldOut}
                      className={`w-full border rounded-lg p-2.5 text-sm font-medium focus:outline-none transition-colors ${
                        isSoldOut 
                          ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                          : 'bg-white border-gray-300 focus:border-[var(--color-primary)]'
                      }`}
                    />
                  </div>
                  
                  {!isSoldOut ? (
                    <button
                      onClick={() => handleConfirmSale(b.id)}
                      disabled={isLoading}
                      className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "판매 확정 및 발송"}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                       <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-sm">
                         <CheckCircle className="w-4 h-4" />
                         판매 완료됨
                       </div>
                       <button
                         onClick={() => shareToKakao(b)}
                         className="w-full bg-[#FEE500] text-[#000000] py-3 rounded-xl font-bold hover:bg-[#FEE500]/90 transition-colors flex items-center justify-center gap-2"
                       >
                         <MessageCircle className="w-5 h-5" />
                         카카오톡으로 공유
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
