import { Flower2, Sparkles, ArrowRight, Inbox, Archive } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
        <section className="relative w-full h-[calc(100dvh-4rem)] overflow-hidden flex items-center bg-[#FDFCFB]">

          {/* Right half: image contained at natural size, no upscaling */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none">
            <Image
              src="/images/hero-bg-center.png"
              alt="ON:HWA Hero Background"
              fill
              priority
              unoptimized={true}
              className="object-contain object-center"
            />
          </div>

          {/* Gradient: smooth fade from left background color into image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCFB] via-[#FDFCFB]/90 to-transparent pointer-events-none" />

          {/* Text Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-8 w-full">
            <div className="flex flex-col items-start gap-10 max-w-2xl">

              <span className="text-xs font-medium tracking-widest text-[var(--color-secondary)] border border-[var(--color-border)] px-3 py-1">
                꽃다발 AI 네이밍 서비스
              </span>

              <h1 className="font-outfit text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold leading-tight text-[var(--color-primary)] whitespace-nowrap">
                당신의 꽃에,<br />
                이야기를 불어넣습니다
              </h1>

              <p className="max-w-lg text-base leading-loose text-[var(--color-secondary)]">
                꽃 한 다발이 언어가 되는 순간이 있습니다.<br />
                온:화는 AI로 꽃다발에 고유한 이름과 이야기를 새기고,<br />
                그 기억을 시들지 않는 형태로 간직합니다.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium uppercase tracking-wide px-8 py-3 hover:opacity-80 transition-all shadow-lg hover:shadow-xl"
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

            <div className="mb-16 flex items-center gap-4">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-xs uppercase tracking-widest font-medium text-[var(--color-secondary)]">
                온:화가 하는 일
              </span>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <div className="grid gap-px sm:grid-cols-2 bg-[var(--color-border)]">

              {/* ── 사장님 (플로리스트) 컬럼 ── */}
              <div className="bg-[var(--color-bg-light)] flex flex-col">

                {/* 역할 레이블 */}
                <div className="px-8 pt-8 pb-5 border-b border-[var(--color-border)] flex items-center gap-3">
                  <Flower2 className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                    플로리스트 (사장님)
                  </span>
                </div>

                {/* 기능 1 */}
                <div className="p-8 flex flex-col gap-4 border-b border-[var(--color-border)]">
                  <div className="bg-[var(--color-primary)] w-10 h-10 flex items-center justify-center">
                    <Inbox className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                      커스텀 꽃다발 주문 수신
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                      구매자의 주문 요청을 확인하고 견적을 제안합니다. 채택된 주문에만 진행하면 됩니다.
                    </p>
                  </div>
                </div>

                {/* 기능 2 */}
                <div className="p-8 flex flex-col gap-4">
                  <div className="bg-[var(--color-primary)] w-10 h-10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                      AI 꽃다발 네이밍
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                      완성된 꽃다발 사진을 업로드하면 AI가 꽃말과 분위기를 읽어 고유한 이름과 서사를 생성합니다. 받는 이에게 이름 붙여진 꽃을 전하세요.
                    </p>
                  </div>
                </div>

              </div>

              {/* ── 구매자 컬럼 ── */}
              <div className="bg-white flex flex-col">

                {/* 역할 레이블 */}
                <div className="px-8 pt-8 pb-5 border-b border-[var(--color-border)] flex items-center gap-3">
                  <Flower2 className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                    구매자
                  </span>
                </div>

                {/* 기능 1 */}
                <div className="p-8 flex flex-col gap-4 border-b border-[var(--color-border)]">
                  <div className="bg-accent w-10 h-10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                      AI 커스텀 꽃다발 주문
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                      상황과 예산을 입력하면 AI가 꽃 구성을 제안하고, 여러 플로리스트의 견적을 비교해 고를 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 기능 2 */}
                <div className="p-8 flex flex-col gap-4">
                  <div className="bg-accent w-10 h-10 flex items-center justify-center">
                    <Archive className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-outfit text-base font-semibold text-[var(--color-primary)]">
                      포토카드 아카이빙
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                      받은 꽃을 찍어 디지털 포토카드로 만들고 영구 보관합니다. 꽃의 이름과 이야기가 카드 안에 함께 담깁니다.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section className="w-full py-20 bg-[var(--color-primary)]">
          <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex flex-col gap-3">
              <p className="font-outfit text-2xl sm:text-3xl font-semibold text-white leading-snug">
                꽃 한 다발이 언어가 되는 순간,<br />
                <span className="text-accent">온:화가 함께합니다.</span>
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                사장님이시라면 — 꽃다발을 AI와 함께 쇼케이스에 채워보세요.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0"
            >
              시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] bg-white py-8">
        <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flower2 className="h-4 w-4 text-[var(--color-secondary)]" />
            <span className="text-xs text-[var(--color-secondary)]">© 2026 ON:HWA. All rights reserved.</span>
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
