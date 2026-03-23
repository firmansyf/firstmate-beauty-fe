'use client';

import Loader from '@/components/common/Loader';
import ProductCard from '@/components/customer/ProductCard';
import { productsAPI } from '@/lib/api';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    order: searchParams.get('order') || 'DESC',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productsAPI.getAll({
        ...filters,
        page: pagination.currentPage,
        limit: 12,
      });
      setProducts(response.data.data);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalItems,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (sortValue: string) => {
    const [sortBy, order] = sortValue.split('-');
    const newFilters = { ...filters, sortBy, order };
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/products?${params.toString()}`);
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Produk</h1>
          <p className="text-gray-500 mt-1">Temukan produk skincare terbaik untuk kulit Anda</p>
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
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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
                    onClick={() => handleFilterChange('category', '')}
                    className={`w-full cursor-pointer text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      !filters.category
                        ? 'bg-pink-50 text-pink-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange('category', category.slug)}
                      className={`w-full cursor-pointer text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        filters.category === category.slug
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
                  value={`${filters.sortBy}-${filters.order}`}
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
            {/* Results count */}
            {!isLoading && (
              <p className="text-sm text-gray-500 mb-4">
                {pagination.totalItems} produk ditemukan
              </p>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader text="Memuat produk..." />
              </div>
            ) : products.length > 0 ? (
              <div>
                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })
                      }
                      disabled={pagination.currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setPagination({ ...pagination, currentPage: page })}
                          className={`w-9 h-9 text-sm cursor-pointer rounded-lg font-medium transition-colors ${
                            pagination.currentPage === page
                              ? 'bg-pink-600 text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
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
    </main>
  );
}
