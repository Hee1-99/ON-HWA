"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera } from "lucide-react";

/* ── 타이핑 훅 ──────────────────────────────────────────── */
function useTypewriter(text: string, startDelay: number, speed: number) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setActive(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!active || index >= text.length) return;
    const t = setTimeout(() => setIndex((i) => i + 1), speed);
    return () => clearTimeout(t);
  }, [active, index, text, speed]);

  return {
    displayed: text.slice(0, index),
    isDone: index >= text.length,
  };
}

/* ── Props ──────────────────────────────────────────────── */
interface UnboxingRevealProps {
  bouquetName: string;
  bouquetStory: string;
  imageUrl: string;
}

/* ── Component ──────────────────────────────────────────── */
export default function UnboxingReveal({
  bouquetName,
  bouquetStory,
  imageUrl,
}: UnboxingRevealProps) {
  /* 이름 타이핑: 이미지 언블러 시작 0.8s 후 시작 */
  const { displayed: typedName, isDone: nameDone } = useTypewriter(
    bouquetName,
    /* startDelay */ 1000,
    /* speed ms/char */ 80
  );

  /* CTA 클릭 → 사진 업로드 섹션으로 부드러운 스크롤 */
  function scrollToUpload() {
    document.getElementById("photo-upload")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="flex flex-col gap-7">

      {/* ── 이미지: blur → clear ─────────────────────────── */}
      {imageUrl && (
        <motion.div
          className="unboxing-image-wrap"
          initial={{ filter: "blur(22px)", opacity: 0.55, scale: 1.04 }}
          animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
          transition={{ duration: 1.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={imageUrl}
            alt={bouquetName}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
            priority
          />

          {/* 하단 그라데이션 */}
          <div className="unboxing-image-overlay" />

          {/* 타이핑 이름 */}
          <div className="unboxing-name-wrap">
            <p className="unboxing-name-text">
              {typedName}
              {/* 타이핑 중일 때만 커서 표시 */}
              {!nameDone && <span className="unboxing-cursor" aria-hidden />}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── 시적 서사 ──────────────────────────────────────── */}
      <AnimatePresence>
        {nameDone && bouquetStory && (
          <motion.div
            className="unboxing-story-section"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="unboxing-story-deco" aria-hidden>🌸</p>
            <p className="unboxing-story-body">{bouquetStory}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA 버튼 ───────────────────────────────────────── */}
      <AnimatePresence>
        {nameDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={scrollToUpload}
              className="unboxing-cta-btn"
            >
              <Camera size={18} aria-hidden />
              이 순간을 카드로 기록하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
