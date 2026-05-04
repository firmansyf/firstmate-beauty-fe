// src/app/admin/products/page.tsx
'use client';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Edit, Eye, Package, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface PaginationMeta {
  total: number;
  totalPages: number;
}

const LIMIT = 10;

const ProductTableSkeleton = () => (
  <Card>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Produk</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kategori</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Harga</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Stok</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: LIMIT }).map((_, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 animate-pulse rounded w-32" />
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="h-3.5 bg-gray-200 animate-pulse rounded w-20" />
              </td>
              <td className="py-3 px-4">
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-gray-200 animate-pulse rounded w-24" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-16" />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-14" />
              </td>
              <td className="py-3 px-4">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-14" />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

interface PaginationBarProps {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationBar = ({ page, total, totalPages, onPageChange }: PaginationBarProps) => {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} produk
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">1</button>
            {start > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 text-sm rounded-lg ${p === page ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, totalPages: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search — resets page when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories once
  useEffect(() => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data.data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Single fetch effect — cancellable to prevent race conditions
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    productsAPI.adminGetAll({
      page,
      limit: LIMIT,
      search: debouncedSearch || undefined,
      category: categoryFilter || undefined,
      is_available: statusFilter || undefined,
    })
      .then(res => {
        if (cancelled) return;
        setProducts(res.data.data);
        setMeta({ total: res.data.pagination.total, totalPages: res.data.pagination.totalPages });
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Error fetching products:', err);
        toast.error('Gagal memuat produk');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, debouncedSearch, categoryFilter, statusFilter, refreshKey]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  }, []);

  const handleDelete = useCallback(async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) return;
    try {
      await productsAPI.delete(id);
      toast.success('Produk berhasil dihapus');
      setRefreshKey(k => k + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk');
    }
  }, []);

  const hasFilter = debouncedSearch || categoryFilter || statusFilter;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kelola Produk</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} produk tersedia</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 cursor-pointer text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      {isLoading ? (
        <ProductTableSkeleton />
      ) : products.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Stok</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-[260px] sm:max-w-[360px] lg:max-w-[440px]">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              sizes="40px"
                              loading="lazy"
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate" title={product.name}>{product.name}</p>
                          <p className="text-xs text-gray-500 truncate" title={product.slug}>{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {product.category_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.discount_price || product.price)}
                      </p>
                      {product.discount_price && (
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.stock > 10
                          ? 'bg-pink-50 text-pink-700'
                          : product.stock > 0
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {product.stock} / {product.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.is_available ? 'bg-pink-50 text-pink-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.is_available ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            page={page}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </Card>
      ) : (
        <EmptyState
          icon={Package}
          title="Tidak ada produk"
          description={
            hasFilter
              ? 'Tidak ada produk yang cocok dengan filter'
              : 'Belum ada produk, tambahkan produk pertama Anda'
          }
          actionLabel={!hasFilter ? 'Tambah Produk' : undefined}
          onAction={!hasFilter ? () => router.push('/admin/products/new') : undefined}
        />
      )}
    </motion.div>
  );
}
