export default function OrderLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
      <div className="h-24 bg-gray-100 rounded-2xl animate-pulse border border-gray-200 mb-4" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
        ))}
      </div>
    </div>
  );
}
