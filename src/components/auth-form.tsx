"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Flower2, Store } from "lucide-react";

type Role = "florist" | "general";

export function AuthForm() {
  const searchParams = useSearchParams();
  const fromArchive = searchParams.get("from") === "archive";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>(fromArchive ? "general" : "florist");
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userRole = data.user?.user_metadata?.role as Role | undefined;
        router.push(userRole === "general" ? "/archive" : "/dashboard");
        router.refresh();
      } else {
        if (!phone.trim()) throw new Error("전화번호를 입력해주세요.");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, phone } },
        });
        if (error) throw error;
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isFlorist = role === "florist";

  return (
    <div className="w-full max-w-md bg-[var(--warm-card)] rounded-2xl p-8 border-2 border-[var(--warm-border)] shadow-[0_8px_32px_rgba(180,100,80,0.08)]">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold font-outfit text-[var(--warm-text)] mb-2">ON:HWA</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Role selector — signup only */}
        {!isLogin && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--warm-text)]">회원 유형</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("florist")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === "florist"
                    ? "border-[var(--warm-rose)] bg-[var(--warm-rose)]/5"
                    : "border-[var(--warm-border)] hover:border-[var(--warm-rose)]/50"
                }`}
              >
                <Store className="w-5 h-5 text-[var(--warm-rose)]" />
                <span className="text-sm font-bold text-[var(--warm-text)]">사장님</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("general")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === "general"
                    ? "border-[var(--warm-rose)] bg-[var(--warm-rose)]/5"
                    : "border-[var(--warm-border)] hover:border-[var(--warm-rose)]/50"
                }`}
              >
                <Flower2 className="w-5 h-5 text-[var(--warm-rose)]" />
                <span className="text-sm font-bold text-[var(--warm-text)]">일반 회원</span>
              </button>
            </div>
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
            placeholder="example@onhwa.com"
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

        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--warm-text)]">전화번호 (- 없이 입력)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              className="warm-input"
              placeholder="01012345678"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[var(--warm-rose)] text-white py-3.5 rounded-xl font-bold shadow-sm hover:bg-[var(--warm-text)] hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLogin ? "로그인" : "가입하기"}
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
          {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </div>
  );
}
