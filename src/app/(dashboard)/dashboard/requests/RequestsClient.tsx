"use client";

import { useState } from "react";
import { submitQuote } from "@/app/actions/orderActions";
import { CheckCircle, Loader2, Send, Clock, User, MessageSquare } from "lucide-react";
import Link from "next/link";

interface CustomRequest {
  id: string;
  recipient_target: string;
  occasion: string;
  budget: string;
  ai_flower_recommendation: string;
  ai_message: string;
  status: string;
  created_at: string;
}

export default function RequestsClient({ 
  initialRequests, 
  myQuoteRequestIds 
}: { 
  initialRequests: CustomRequest[], 
  myQuoteRequestIds: string[] 
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [quoteForms, setQuoteForms] = useState<Record<string, { price: string, desc: string }>>({});

  const handleUpdateField = (id: string, field: "price" | "desc", value: string) => {
    setQuoteForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id] || { price: "", desc: "" },
        [field]: value
      }
    }));
  };

  const handleSubmit = async (id: string) => {
    const data = quoteForms[id];
    if (!data || !data.price || !data.desc) return alert("견적 금액과 설명을 입력해주세요.");
    
    setLoadingId(id);
    try {
      const res = await submitQuote(id, Number(data.price), data.desc);
      if (res.success) {
        alert("견적이 성공적으로 전송되었습니다!");
        myQuoteRequestIds.push(id);
        const newForms = {...quoteForms};
        delete newForms[id];
        setQuoteForms(newForms);
      } else {
        alert(res.error);
      }
    } catch (e) {
      alert("전송 중 오류가 발생했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-gray-50 border p-4 rounded-xl">
        <span className="text-sm font-bold text-gray-700">진행 중인 요청: {requests.length}건</span>
        <Link href="/dashboard" className="text-sm font-bold text-[var(--warm-rose)] hover:underline">
          &larr; 대시보드 홈으로
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border text-gray-500">
          현재 등록된 새로운 맞춤 주문 요청이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {requests.map(req => {
            const hasDraft = !!quoteForms[req.id];
            const isSubmitted = myQuoteRequestIds.includes(req.id);
            const rData = quoteForms[req.id] || { price: "", desc: "" };

            return (
              <div key={req.id} className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4">
                {/* Header info */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-[var(--warm-rose)] flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(req.created_at).toLocaleString()}</span>
                    <h3 className="font-outfit text-lg font-bold text-[var(--color-primary)]">맞춤 주문 요약</h3>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">예산: {req.budget || "미정"}</span>
                </div>

                {/* Body info */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 items-start">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed"><strong className="text-gray-900">상황 & 대상:</strong> {req.occasion} (받는 분: {req.recipient_target})</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Sparkles className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <strong className="text-gray-900 block mb-1">AI 추천 구성:</strong>
                      <span className="bg-gray-50 p-3 rounded-lg block border leading-relaxed break-keep">{req.ai_flower_recommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Action Area */}
                <div className="mt-2 pt-4 border-t flex flex-col gap-3">
                  {isSubmitted ? (
                    <div className="flex items-center justify-center py-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      사장님의 견적이 성공적으로 제안되었습니다.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 bg-[var(--color-bg-default)] p-4 rounded-xl border">
                        <label className="text-xs font-bold text-[var(--color-secondary)] uppercase">새로운 견적 제안하기</label>
                        <input 
                          type="number" 
                          placeholder="제안 가격 (원)" 
                          className="warm-input bg-white text-sm py-2"
                          value={rData.price}
                          onChange={e => handleUpdateField(req.id, "price", e.target.value)}
                        />
                        <textarea 
                          placeholder="꽃 구성 설명 및 매장 픽업/배달 가능 여부 (선택될 수 있도록 매력적으로 작성해주세요!)" 
                          className="warm-input bg-white text-sm py-2 resize-none h-20"
                          value={rData.desc}
                          onChange={e => handleUpdateField(req.id, "desc", e.target.value)}
                        />
                      </div>
                      
                      <button
                        onClick={() => handleSubmit(req.id)}
                        disabled={loadingId === req.id || !rData.price || !rData.desc}
                        className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {loadingId === req.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                        견적 보내기
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
