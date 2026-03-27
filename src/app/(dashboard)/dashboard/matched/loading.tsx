export default function MatchedLoading() {
  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen">
      <div className="flex flex-col gap-2 mb-10">
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-9 w-72 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mt-1" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse border border-indigo-100" />
        ))}
      </div>
    </div>
  );
}
