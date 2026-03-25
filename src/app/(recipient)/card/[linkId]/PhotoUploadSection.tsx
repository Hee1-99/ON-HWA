"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Props {
  /** archives 버킷 내 저장 폴더 (예: card/abc123) */
  folder?: string;
}

export default function PhotoUploadSection({ folder = "card" }: Props) {
  const [preview, setPreview]     = useState<string | null>(null);
  const [rawFile, setRawFile]     = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef       = useRef<HTMLInputElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  /* style={{}} / aria expression 없이 명령형으로 진행률 반영 */
  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    bar.setAttribute("aria-valuenow", String(progress));
    const fill = bar.querySelector<HTMLDivElement>(".photo-progress-fill");
    if (fill) fill.style.width = `${progress}%`;
  }, [progress]);

  const { status, progress, errorMessage, publicUrl, upload, reset } =
    useImageUpload({
      bucket: "archives",
      folder,
      onSuccess: (url) => {
        /* TODO: publicUrl을 받아 Canvas 카드 합성(F02) 연결 */
        console.log("업로드 완료:", url);
      },
    });

  const isCompressing = status === "compressing";
  const isUploading   = status === "uploading";
  const isBusy        = isCompressing || isUploading;
  const isDone        = status === "done";

  /* ── 파일 선택 ─────────────────────────────────────────── */
  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    /* 기존 ObjectURL 해제 */
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPreview(URL.createObjectURL(file));
    setRawFile(file);
    reset();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }, []);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  /* ── 업로드 실행 ───────────────────────────────────────── */
  async function handleMakeCard() {
    if (!rawFile) return;
    await upload(rawFile);
  }

  /* ── 진행 상태 라벨 ────────────────────────────────────── */
  function statusLabel(): string {
    if (isCompressing) return `압축 중… ${progress}%`;
    if (isUploading)   return `업로드 중… ${progress}%`;
    if (isDone)        return "포토카드 준비 완료 🌸";
    return "포토카드 만들기";
  }

  return (
    <section id="photo-upload" className="photo-section">

      <p className="photo-section-eyebrow">카드 만들기</p>
      <h2 className="photo-section-title">
        지금 이 꽃과 함께한<br />
        순간을 담아보세요.
      </h2>

      {/* ── 드롭존 ──────────────────────────────────────────── */}
      <div
        className={`photo-dropzone ${isDragging ? "photo-dropzone--active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
      >
        {preview ? (
          <Image
            src={preview}
            alt="업로드된 사진 미리보기"
            fill
            className="photo-preview"
            unoptimized
          />
        ) : (
          <>
            <span className="photo-dropzone-icon" aria-hidden>📷</span>
            <span className="photo-dropzone-label">탭하여 사진 추가</span>
          </>
        )}

        <input
          ref={inputRef}
          id="photo-file-input"
          type="file"
          accept="image/*"
          onChange={handleChange}
          aria-label="사진 파일 선택"
        />
      </div>

      {/* ── 진행률 바 ───────────────────────────────────────── */}
      {isBusy && (
        <div className="photo-progress-wrap">
          <div
            ref={progressBarRef}
            className="photo-progress-bar"
            role="progressbar"
            aria-label="업로드 진행률"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="photo-progress-fill" />
          </div>
          <p className="photo-progress-label">{statusLabel()}</p>
        </div>
      )}

      {/* ── 오류 메시지 ─────────────────────────────────────── */}
      {status === "error" && errorMessage && (
        <p className="share-error">{errorMessage}</p>
      )}

      {/* ── 사진 변경 / 완료 링크 ───────────────────────────── */}
      {preview && !isBusy && (
        <button
          type="button"
          onClick={() => { inputRef.current?.click(); }}
          className="share-done-reset share-done-reset--center"
        >
          {isDone ? "다시 촬영하기" : "다른 사진으로 변경하기"}
        </button>
      )}

      {/* ── 메인 액션 버튼 ──────────────────────────────────── */}
      <button
        type="button"
        disabled={!rawFile || isBusy || isDone}
        onClick={handleMakeCard}
        className="photo-make-btn"
      >
        {isBusy ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {statusLabel()}</>
        ) : (
          <><Sparkles size={18} aria-hidden /> {statusLabel()}</>
        )}
      </button>

    </section>
  );
}
