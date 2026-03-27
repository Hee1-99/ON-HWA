export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div className="h-9 w-60 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse border border-gray-200" />
        ))}
      </div>
    </div>
  );
}
