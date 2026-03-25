/**
 * compress.ts
 * Canvas API 기반 이미지 리사이징 + WebP 변환 유틸리티.
 * 외부 라이브러리 없이 브라우저 내장 API만 사용합니다.
 */

export interface CompressOptions {
  /** 허용 최대 파일 크기 (bytes). 기본 1MB */
  maxBytes?: number;
  /** 최장 변(가로/세로) 최대 픽셀. 기본 1920 */
  maxDimension?: number;
  /** 초기 WebP 품질 (0–1). 기본 0.85 */
  initialQuality?: number;
  /** 품질 감소 스텝. 기본 0.05 */
  qualityStep?: number;
  /** 허용 최저 품질. 이 이하로는 내리지 않음 */
  minQuality?: number;
}

export interface CompressResult {
  file: File;
  /** 압축 후 바이트 크기 */
  sizeBytes: number;
  /** 최종 적용된 WebP 품질 */
  quality: number;
  /** 최종 출력 치수 */
  width: number;
  height: number;
}

/**
 * 이미지 File → WebP로 압축. maxBytes 이하가 될 때까지 품질을 반복 감소.
 * 최저 품질에서도 초과 시 치수를 0.75배로 축소하여 재시도.
 */
export async function compressToWebP(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxBytes      = 1 * 1024 * 1024, // 1 MB
    maxDimension  = 1920,
    initialQuality = 0.85,
    qualityStep   = 0.05,
    minQuality    = 0.40,
  } = options;

  /* ── 1. File → HTMLImageElement ───────────────────────── */
  const img = await fileToImage(file);

  /* ── 2. 초기 치수 계산 ─────────────────────────────────── */
  let { width, height } = scaleDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxDimension
  );

  /* ── 3. 품질 반복 압축 루프 ────────────────────────────── */
  let quality = initialQuality;

  while (true) {
    const blob = await drawAndExport(img, width, height, quality);

    if (blob.size <= maxBytes || quality <= minQuality) {
      /* 목표 달성 or 최저 품질 도달 → 완료 */
      if (blob.size <= maxBytes) {
        return makeResult(blob, file.name, quality, width, height);
      }

      /* 최저 품질로도 초과 → 치수 75% 축소 후 품질 초기화 */
      width  = Math.round(width  * 0.75);
      height = Math.round(height * 0.75);
      quality = initialQuality;
      continue;
    }

    quality = Math.max(minQuality, parseFloat((quality - qualityStep).toFixed(2)));
  }
}

/* ── 내부 헬퍼 ────────────────────────────────────────── */

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지 로딩 실패")); };
    img.src = url;
  });
}

function scaleDimensions(
  w: number,
  h: number,
  maxSide: number
): { width: number; height: number } {
  if (w <= maxSide && h <= maxSide) return { width: w, height: h };
  const ratio = w > h ? maxSide / w : maxSide / h;
  return {
    width:  Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

function drawAndExport(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width  = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("Canvas 2D context 생성 실패")); return; }

    /* 부드러운 다운샘플링 */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("WebP 변환 실패")); return; }
        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

function makeResult(
  blob: Blob,
  originalName: string,
  quality: number,
  width: number,
  height: number
): CompressResult {
  const baseName = originalName.replace(/\.[^.]+$/, "");
  const file = new File([blob], `${baseName}.webp`, { type: "image/webp" });
  return { file, sizeBytes: blob.size, quality, width, height };
}
