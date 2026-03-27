export default function ArchiveLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-default)]">
      <header className="h-header px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
          ))}
        </div>
      </main>
    </div>
  );
}
