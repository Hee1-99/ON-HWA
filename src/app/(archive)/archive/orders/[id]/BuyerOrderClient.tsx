"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptQuote } from "@/app/actions/orderActions";
import { Loader2, CheckCircle, Store, Tag, MessagesSquare, ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";

interface RequestData {
  id: string;
  occasion: string;
  recipient_target: string;
  budget: string;
  ai_flower_recommendation: string;
  ai_message: string;
  status: string;
}

interface QuoteData {
  id: string;
  shop_name: string;
  shop_phone?: string;
  price: number;
  description: string;
  status: string;
  created_at: string;
}

export default function BuyerOrderClient({ request, initialQuotes }: { request: RequestData, initialQuotes: QuoteData[] }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (quoteId: string) => {
    if (!confirm("이 사장님의 견적을 최종 채택하시겠습니까?")) return;
    
    setLoadingId(quoteId);
    try {
      const res = await acceptQuote(quoteId, request.id);
      if (res.success) {
        alert("선택이 완료되었습니다! 사장님이 곧 별도 연락을 드릴 예정입니다.");
        // UI Optimistic Update
        setQuotes(prev => prev.map(q => ({
          ...q,
          status: q.id === quoteId ? "accepted" : "rejected"
        })));
        router.refresh();
      } else {
        alert(res.error || "오류가 발생했습니다.");
      }
    } catch (err) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  const isAwarded = request.status === "awarded" || request.status === "completed";

  return (
    <div className="flex flex-col gap-8">
      <Link href="/archive" className="flex flex-col mb-2 text-gray-500 hover:text-gray-800 transition-colors w-min whitespace-nowrap">
        <span className="flex items-center gap-2"><ArrowLeft className="w-5 h-5"/> 뒤로 가기</span>
      </Link>
      
      {/* Request Details */}
      <div className="bg-[#FFF8F5] border border-[#F4E3DD] rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
        <h2 className="font-outfit text-xl font-bold text-[var(--warm-rose)] border-b border-[#F4E3DD] pb-4">내 맞춤 주문 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-500">선물 상황 및 대상</span>
            <p className="font-myeongjo text-[var(--color-primary)] bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">{request.occasion} (누구에게: {request.recipient_target})</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-500">AI 추천 구성</span>
            <p className="font-myeongjo text-[var(--color-primary)] bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">{request.ai_flower_recommendation}</p>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--warm-rose)] opacity-5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quotes Area */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-outfit text-2xl font-bold text-[var(--color-primary)]">도착한 견적 제안</h2>
          <span className="text-sm font-bold text-white bg-[var(--color-primary)] px-3 py-1 rounded-full">{quotes.length}건</span>
        </div>

        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-4" />
            <p className="text-gray-600 font-bold">근처 꽃집 사장님들이 큐레이션을 확인하고 있습니다.</p>
            <p className="text-sm text-gray-400 mt-1">견적이 도착할 때까지 조금만 기다려주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map(q => {
              const accepted = q.status === "accepted";
              const rejected = q.status === "rejected";
              
              return (
                <div key={q.id} className={`flex flex-col gap-4 bg-white p-6 rounded-2xl border transition-all ${
                  accepted ? "border-[var(--warm-rose)] ring-4 ring-[var(--warm-rose)]/10" :
                  rejected ? "opacity-50 grayscale border-gray-200" :
                  "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Store className="w-5 h-5 text-gray-500" /></div>
                      <div>
                        <h3 className="font-bold text-[var(--color-primary)]">{q.shop_name}</h3>
                        <span className="text-xs text-gray-500">{new Date(q.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {accepted && <span className="bg-[var(--warm-rose)] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 채택됨</span>}
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xl">
                      <Tag className="w-5 h-5 text-[var(--warm-rose)]" /> {q.price.toLocaleString()}원
                    </div>
                    <div className="flex gap-2">
                      <MessagesSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl flex-1 leading-relaxed whitespace-pre-wrap">{q.description}</p>
                    </div>
                  </div>

                  {accepted && (
                    <div className="mt-2 text-sm font-bold text-[var(--warm-rose)] bg-[var(--warm-rose)]/5 border border-[var(--warm-rose)]/20 p-4 rounded-xl flex flex-col gap-1">
                      <span className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4" /> 사장님 연락처: {q.shop_phone}</span>
                      <span className="text-xs text-[var(--warm-rose)]/80">주문이 성사되었습니다! 위 번호로 문자나 전화를 드려 상세 수령 일정을 조율해주세요.</span>
                    </div>
                  )}

                  {!isAwarded && (
                     <button
                       onClick={() => handleAccept(q.id)}
                       disabled={loadingId !== null}
                       className="mt-4 w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-[var(--warm-rose)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                       {loadingId === q.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle className="w-5 h-5"/>}
                       이 견적 선택하기
                     </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
