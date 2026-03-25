"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressToWebP, CompressOptions } from "@/lib/image/compress";

/* ── 타입 ───────────────────────────────────────────────── */
export type UploadStatus =
  | "idle"
  | "compressing"
  | "uploading"
  | "done"
  | "error";

export interface UseImageUploadOptions {
  /** Supabase Storage 버킷 이름 */
  bucket: string;
  /** 업로드 경로 접두사 (예: "card/abc123"). 파일명은 자동 생성 */
  folder?: string;
  compress?: CompressOptions;
  /** 업로드 완료 콜백 */
  onSuccess?: (publicUrl: string) => void;
  onError?: (message: string) => void;
}

export interface UseImageUploadReturn {
  status: UploadStatus;
  publicUrl: string | null;
  /** 0–100 진행률 (compressing 40% / uploading 100%) */
  progress: number;
  errorMessage: string | null;
  /** 파일을 받아 압축 → Storage 업로드 실행 */
  upload: (file: File) => Promise<void>;
  reset: () => void;
}

/* ── Hook ───────────────────────────────────────────────── */
export function useImageUpload({
  bucket,
  folder = "",
  compress = {},
  onSuccess,
  onError,
}: UseImageUploadOptions): UseImageUploadReturn {
  const [status, setStatus]         = useState<UploadStatus>("idle");
  const [publicUrl, setPublicUrl]   = useState<string | null>(null);
  const [progress, setProgress]     = useState(0);
  const [errorMessage, setError]    = useState<string | null>(null);

  // Refs to hold latest callback/options without including them in useCallback deps
  const compressRef    = useRef(compress);
  const onSuccessRef   = useRef(onSuccess);
  const onErrorRef     = useRef(onError);
  compressRef.current  = compress;
  onSuccessRef.current = onSuccess;
  onErrorRef.current   = onError;

  const reset = useCallback(() => {
    setStatus("idle");
    setPublicUrl(null);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File) => {
    try {
      reset();

      /* ── 1. 압축 (0 → 40%) ──────────────────────────────── */
      setStatus("compressing");
      setProgress(10);

      const compressed = await compressToWebP(file, {
        maxBytes:       1 * 1024 * 1024,
        maxDimension:   1920,
        initialQuality: 0.85,
        ...compressRef.current,
      });

      setProgress(40);

      /* ── 2. Storage 업로드 (40 → 100%) ─────────────────── */
      setStatus("uploading");

      const filename  = generateFilename();
      const storagePath = folder ? `${folder}/${filename}` : filename;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, compressed.file, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      setProgress(90);

      /* ── 3. Public URL 조회 ──────────────────────────────── */
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      setProgress(100);
      setPublicUrl(data.publicUrl);
      setStatus("done");
      onSuccessRef.current?.(data.publicUrl);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.";
      setError(msg);
      setStatus("error");
      onErrorRef.current?.(msg);
    }
  }, [bucket, folder, reset]);

  return { status, publicUrl, progress, errorMessage, upload, reset };
}

/* ── 유틸 ───────────────────────────────────────────────── */
function generateFilename(): string {
  const ts    = Date.now();
  const rand  = Math.random().toString(36).slice(2, 8);
  return `${ts}_${rand}.webp`;
}
