import { Flower2, Sparkles, Camera, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as 'florist' | 'general' | undefined;
  const dashHref = user ? (role === 'general' ? '/archive' : '/dashboard') : '/login';
  const dashLabel = user ? (role === 'general' ? '내 아카이브' : '내 대쉬보드') : '로그인';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-default)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="h-header px-8 flex items-center border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="#">
          <Flower2 className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="font-outfit text-lg font-semibold tracking-tight">
            ON:HWA
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-4 sm:gap-8">
          <Link
            className="hidden sm:block text-sm font-medium uppercase tracking-wide text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
            href="#features"
          >
            주요 기능
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={dashHref}
              className="text-sm font-medium uppercase tracking-wide bg-[var(--color-primary)] text-white px-5 py-2 hover:opacity-80 transition-opacity"
            >
              {dashLabel}
            </Link>
            {user && <LogoutButton />}
          </div>
        </nav>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 lg:py-48 bg-[var(--color-bg-light)]">
          <div className="max-w-5xl mx-auto px-8">
            <div className="flex flex-col items-start gap-8">

              <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-secondary)] border border-[var(--color-border)] px-3 py-1">
                AI 기반 감성 네이밍 플랫폼
              </span>

              <h1 className="font-outfit text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight text-[var(--color-primary)] tracking-tight">
                꽃의 서사를{" "}
                <span className="bg-accent px-2">켜다</span>
                <br />
                ON:HWA
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[var(--color-secondary)]">
                AI가 선물하는 꽃의 이름과 이야기.<br />
                시들지 않는 추억을 디지털 포토카드로 간직하세요.
              </p>

              <div className="flex items-center gap-4 mt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium uppercase tracking-wide px-8 py-3 hover:opacity-80 transition-opacity"
                >
                  시작하기 <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-2 border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium uppercase tracking-wide px-8 py-3 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  더 알아보기
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="w-full py-20 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-8">

            <div className="mb-12 flex items-center gap-4">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-xs uppercase tracking-widest font-medium text-[var(--color-secondary)]">
                핵심 기능
              </span>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-3">

              <div className="feature-card bg-white p-8 flex flex-col gap-5 transition-colors duration-300">
                <div className="bg-accent w-10 h-10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                    AI 감성 네이밍
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                    이미지를 분석하여 꽃다발에 어울리는 시적인 이름과 스토리를 자동 생성합니다.
                  </p>
                </div>
              </div>

              <div className="feature-card bg-white p-8 flex flex-col gap-5 transition-colors duration-300">
                <div className="bg-accent w-10 h-10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                    디지털 포토카드
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                    받은 꽃을 촬영하여 나만의 감성 포토카드로 합성하고 영구히 보관하세요.
                  </p>
                </div>
              </div>

              <div className="feature-card bg-white p-8 flex flex-col gap-5 transition-colors duration-300">
                <div className="bg-accent w-10 h-10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                    안전한 아카이빙
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                    Supabase의 안전한 저장소로 소중한 기록을 언제 어디서나 확인할 수 있습니다.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section className="w-full py-20 bg-[var(--color-primary)]">
          <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
            <p className="font-outfit text-2xl sm:text-3xl font-semibold text-white leading-snug">
              지금 바로 꽃의 서사를<br />
              <span className="text-accent">켜보세요.</span>
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-accent text-[var(--color-primary)] text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              플로리스트로 시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] bg-white py-8">
        <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flower2 className="h-4 w-4 text-[var(--color-secondary)]" />
            <span className="text-xs text-[var(--color-secondary)]">
              © 2026 ON:HWA. All rights reserved.
            </span>
          </div>
          <nav className="flex gap-6">
            <Link className="text-xs text-[var(--color-secondary)] hover:text-[var(--color-primary)] uppercase tracking-wide transition-colors" href="#">
              이용약관
            </Link>
            <Link className="text-xs text-[var(--color-secondary)] hover:text-[var(--color-primary)] uppercase tracking-wide transition-colors" href="#">
              개인정보처리방침
            </Link>
          </nav>
        </div>
      </footer>

    </div>
  );
}
