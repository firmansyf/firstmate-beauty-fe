'use client';

import ProductCard from '@/components/customer/ProductCard';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  stock: number;
  is_available: boolean;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface Filters {
  category?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  page?: string;
}

interface Props {
  initialProducts: Product[];
  initialPagination: Pagination;
  categories: Category[];
  currentFilters: Filters;
}

export default function ProductsClient({
  initialProducts,
  initialPagination,
  categories,
  currentFilters,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentFilters.search || '');

  const currentCategory = currentFilters.category || '';
  const currentSort = `${currentFilters.sortBy || 'created_at'}-${currentFilters.order || 'DESC'}`;
  const currentPage = initialPagination.currentPage;

  // Sync search input when navigating directly to a URL with search params
  useEffect(() => {
    setSearchInput(currentFilters.search || '');
  }, [currentFilters.search]);

  // Debounce search — only push to URL 600ms after user stops typing
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === (currentFilters.search || '')) return;
    const timer = setTimeout(() => {
      const params = buildQuery({ search: trimmed, page: undefined });
      startTransition(() => {
        router.push(`/products${params ? `?${params}` : ''}`);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      category: currentFilters.category,
      search: currentFilters.search,
      sortBy: currentFilters.sortBy,
      order: currentFilters.order,
      ...overrides,
    };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params.toString();
  };

  const handleCategoryChange = (category: string) => {
    const query = buildQuery({ category: category || undefined, page: undefined });
    startTransition(() => {
      router.push(`/products${query ? `?${query}` : ''}`);
    });
  };

  const handleSortChange = (sortValue: string) => {
    const [sortBy, order] = sortValue.split('-');
    const query = buildQuery({ sortBy, order, page: undefined });
    startTransition(() => {
      router.push(`/products${query ? `?${query}` : ''}`);
    });
  };

  const handlePageChange = (page: number) => {
    const query = buildQuery({ page: page.toString() });
    startTransition(() => {
      router.push(`/products${query ? `?${query}` : ''}`);
    });
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Produk</h1>
          <p className="text-gray-500 mt-1">
            Temukan produk skincare terbaik untuk kulit Anda
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk skincare..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full cursor-pointer text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      !currentCategory
                        ? 'bg-pink-50 text-pink-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full cursor-pointer text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentCategory === category.slug
                          ? 'bg-pink-50 text-pink-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutkan
                </label>
                <select
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                >
                  <option value="created_at-DESC">Terbaru</option>
                  <option value="price-ASC">Harga Terendah</option>
                  <option value="price-DESC">Harga Tertinggi</option>
                  <option value="name-ASC">Nama (A-Z)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              {initialPagination.totalItems} produk ditemukan
            </p>

            <div
              className={`transition-opacity duration-200 ${
                isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
              }`}
            >
              {initialProducts.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {initialProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {initialPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: initialPagination.totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 text-sm cursor-pointer rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-pink-600 text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === initialPagination.totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <span className="text-5xl mb-4 block">✨</span>
                  <p className="text-gray-500">Produk tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
