"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, ArrowLeft, Send, Truck, Store } from "lucide-react";
import Link from "next/link";
import { createCustomRequest } from "@/app/actions/orderActions";

export default function NewCustomOrderPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    recipient_target: "",
    occasion: "",
    budget: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<"픽업(매장방문)" | "배달">("픽업(매장방문)");

  const [aiSuggest, setAiSuggest] = useState<{ recommendation: string } | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleAiCurate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient_target || !form.occasion) {
      setErrorMsg("선물 받는 분과 증정 상황을 반드시 입력해주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오류가 발생했습니다.");
      
      setAiSuggest({ recommendation: data.recommendation });
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!aiSuggest) return;
    setSubmitLoading(true);
    setErrorMsg("");
    try {
       const finalOccasion = `[수령: ${deliveryMethod}] ${form.occasion}`;
       const res = await createCustomRequest(
         form.recipient_target,
         finalOccasion,
         form.budget,
         aiSuggest.recommendation,
         ""
       );
       
       if (res.success) {
         alert("맞춤 주문 요청이 사장님들께 성공적으로 전달되었습니다!");
         router.push("/archive");
         router.refresh();
       } else {
         setErrorMsg(res.error || "주문 등록 중 오류가 발생했습니다.");
       }
    } catch (err) {
      setErrorMsg("주문에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/archive" className="p-2 -ml-2 text-gray-400 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-outfit font-bold text-[var(--color-primary)]">맞춤 주문 시작하기</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">
            원하는 상황을 알려주시면 AI가 꽃말을 고려해 완벽한 조합을 추천합니다.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200 mb-6">
            🚨 {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleAiCurate} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--warm-text)]">선물 받는 분은 누구인가요? *</label>
              <input 
                type="text"
                required
                value={form.recipient_target}
                onChange={e => setForm({...form, recipient_target: e.target.value})}
                placeholder="예) 곧 결혼하는 회사 동료, 10주년을 맞은 아내"
                className="warm-input bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--warm-text)]">어떤 상황이나 의미를 담고 싶나요? *</label>
              <textarea 
                required
                rows={3}
                value={form.occasion}
                onChange={e => setForm({...form, occasion: e.target.value})}
                placeholder="예) 오랫동안 준비한 프로젝트를 성공적으로 마친 팀원을 축하하기 위해, 따뜻한 위로를 건네기 위해"
                className="warm-input bg-gray-50 border-gray-200 focus:bg-white resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--warm-text)]">원하시는 예산이나 크기가 있나요? (선택)</label>
              <input 
                type="text"
                value={form.budget}
                onChange={e => setForm({...form, budget: e.target.value})}
                placeholder="예) 5~7만원대, 너무 크지 않은 아담한 사이즈"
                className="warm-input bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--warm-text)]">수령 방법 *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("픽업(매장방문)")}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-2 font-bold ${
                    deliveryMethod === "픽업(매장방문)" ? "border-[var(--warm-rose)] bg-[var(--warm-rose)]/5 text-[var(--color-primary)]" : "border-gray-200 text-gray-400 hover:border-[var(--warm-rose)]/30"
                  }`}
                >
                  <Store className="w-5 h-5" />
                  픽업 (매장 방문)
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("배달")}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-2 font-bold ${
                    deliveryMethod === "배달" ? "border-[var(--warm-rose)] bg-[var(--warm-rose)]/5 text-[var(--color-primary)]" : "border-gray-200 text-gray-400 hover:border-[var(--warm-rose)]/30"
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  배달 (퀵/배송)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <> <Loader2 className="w-5 h-5 animate-spin" /> AI가 꽃의 이야기를 찾는 중... </>
              ) : (
                <> <Sparkles className="w-5 h-5" /> AI 추천 받기 </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#B46A55] border-b pb-2">AI 추천 결과</h2>
              
              <div className="bg-[#FFF8F5] p-6 rounded-2xl border border-[#F4E3DD] flex flex-col gap-4 relative">
                <Sparkles className="absolute top-6 right-6 w-5 h-5 text-[#B46A55] opacity-20" />
                <div>
                  <p className="text-sm font-myeongjo text-[var(--color-primary)] leading-relaxed whitespace-pre-wrap">
                    {aiSuggest?.recommendation}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={submitLoading}
                className="flex-1 py-4 text-sm font-bold text-[var(--color-secondary)] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                다시 입력하기
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={submitLoading}
                className="flex-[2] bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                이 구성으로 견적 요청하기
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-[-10px]">
              주문을 등록하시면 활동 중인 플로리스트들이 확인 후 견적을 제안합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
