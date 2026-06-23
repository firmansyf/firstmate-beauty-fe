export default function ProductsLoading() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Produk</h1>
          <p className="text-gray-500 mt-1">
            Temukan produk skincare terbaik untuk kulit Anda
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-12" />
                <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
                <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
              </div>
            </div>
          </aside>

          {/* Products grid skeleton */}
          <div className="flex-1">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-32 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-16" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
