"use client";

import { useState } from "react";
import { CheckCircle, Clock, User, Phone, Sparkles, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import OrderNamingPanel from "./OrderNamingPanel";

export default function MatchedClient({ acceptedQuotes }: { acceptedQuotes: any[] }) {
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);

  if (acceptedQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 py-24 gap-4">
        <CheckCircle className="w-12 h-12 text-gray-300" />
        <p className="font-bold text-gray-500">아직 매칭된 주문이 없습니다.</p>
        <p className="text-sm text-gray-400">커스텀 주문 요청에 견적을 제안하고 고객의 선택을 기다려보세요.</p>
        <Link href="/dashboard/requests" className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-100 transition-colors">
          요청 확인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {acceptedQuotes.map((quote) => (
        <div key={quote.id} className="flex flex-col">
          {/* 카드 */}
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group hover:shadow-lg hover:border-indigo-300 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] pointer-events-none -z-10 transition-transform group-hover:scale-110" />

            {/* 상단: 가격 + 날짜 */}
            <div className="flex justify-between items-start z-10 border-b border-gray-50 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="w-3 h-3" /> {new Date(quote.created_at).toLocaleString()}
                </span>
                <div className="text-2xl font-bold text-indigo-950 flex items-center gap-2">
                  {quote.price.toLocaleString()}원
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                    최종 견적가
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* 고객 요청 */}
            <div className="flex flex-col gap-4 z-10">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">고객 요청 사항</span>
                  <p className="text-sm font-bold text-gray-900 leading-relaxed break-keep">
                    대상: {quote.request.recipient_target}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1 border-l-2 border-gray-200 pl-3 py-1">
                    {quote.request.occasion}
                  </p>
                </div>
              </div>

              {/* 내 견적 */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">내가 보낸 견적 메시지</span>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.description}</p>
              </div>

              {/* 구매자 연락처 */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col gap-2">
                <p className="text-sm font-bold text-indigo-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> 구매자 연락처: {quote.buyer_phone}
                </p>
                <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                  고객님이 견적을 확정했습니다! 위 연락처로 제작 및 수령 방식을 조율해주세요.
                </p>
              </div>

              {/* 서사 불어넣기 버튼 */}
              <button
                type="button"
                onClick={() => setActiveQuoteId(activeQuoteId === quote.id ? null : quote.id)}
                className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  activeQuoteId === quote.id
                    ? "bg-gray-100 text-gray-500"
                    : "bg-[var(--color-primary)] text-white hover:bg-black"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {activeQuoteId === quote.id ? "닫기" : "서사 불어넣기"}
              </button>
            </div>
          </div>

          {/* 인라인 네이밍 패널 */}
          {activeQuoteId === quote.id && (
            <OrderNamingPanel
              quoteDescription={quote.description}
              quoteOccasion={quote.request?.occasion ?? ""}
              onClose={() => setActiveQuoteId(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
