"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("회원가입이 완료되었습니다!");
        setIsLogin(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[var(--warm-card)] rounded-2xl p-8 border-2 border-[var(--warm-border)] shadow-[0_8px_32px_rgba(180,100,80,0.08)]">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold font-outfit text-[var(--warm-text)] mb-2">ON:HWA</h1>
        <p className="text-[var(--warm-muted)] font-medium text-sm">
          사장님 전용 매니지먼트 라운지
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[var(--warm-text)]">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="warm-input"
            placeholder="shop@onhwa.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[var(--warm-text)]">비밀번호</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="warm-input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[var(--warm-rose)] text-white py-3.5 rounded-xl font-bold shadow-sm hover:bg-[var(--warm-text)] hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLogin ? "대시보드 로그인" : "신규 입점 가입"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--warm-border)] text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg("");
          }}
          className="text-sm text-[var(--warm-muted)] hover:text-[var(--warm-rose)] font-bold transition-colors"
        >
          {isLogin ? "아직 계정이 없으신가요? 입점 신청" : "이미 입점하셨나요? 로그인"}
        </button>
      </div>
    </div>
  );
}
