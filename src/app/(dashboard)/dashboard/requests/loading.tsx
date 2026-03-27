export default function RequestsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-2">
        <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mt-1" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
        ))}
      </div>
    </div>
  );
}
