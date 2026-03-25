import BouquetUploader from "@/components/bouquet/BouquetUploader";

export default function NewBouquetPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* Header section for dashboard */}
      <header className="h-header px-8 flex items-center border-b border-[var(--color-border)] bg-white sticky top-0 z-10">
        <h1 className="font-outfit font-semibold text-lg text-[var(--color-primary)]">새로운 꽃다발 등록</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center flex flex-col items-center gap-2">
           <span className="inline-block px-3 py-1 bg-white border border-[var(--color-border)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest">
             Step 1
           </span>
           <h2 className="text-2xl font-bold font-outfit mt-2">사진 업로드 & AI 네이밍</h2>
           <p className="text-[var(--color-secondary)] text-sm">준비하신 꽃다발 사진을 올려주시면, AI가 감성적인 이름과 스토리를 제안합니다.</p>
        </div>

        <BouquetUploader />
      </main>
    </div>
  );
}
