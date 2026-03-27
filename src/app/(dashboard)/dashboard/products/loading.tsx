export default function ProductsLoading() {
  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mt-1" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
        ))}
      </div>
    </div>
  );
}
