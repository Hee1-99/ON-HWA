"use client";

import { useState } from "react";
import { confirmSale } from "@/app/actions/bouquetActions";
import { CheckCircle, Phone, Lock, Gift, Loader2, MessageCircle } from "lucide-react";

export default function DashboardClient({ initialBouquets }: { initialBouquets: any[] }) {
  const [bouquets, setBouquets] = useState(initialBouquets);
  const [phoneInputs, setPhoneInputs] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'selling' | 'sold'>('all');

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

  return (
    <div className="flex flex-col gap-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-200">
          🚨 {errorMsg}
        </div>
      )}

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

      {filteredBouquets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium text-lg">해당 조건의 꽃다발이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBouquets.map((b) => {
          const isSoldOut = b.status === "sent" || b.status === "archived";
          const isLoading = loadingId === b.id;

          return (
            <div 
              key={b.id} 
              className={`flex flex-col bg-white rounded-2xl border overflow-hidden transition-all shadow-sm ${
                isSoldOut ? "border-gray-200 opacity-80" : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md"
              }`}
            >
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
