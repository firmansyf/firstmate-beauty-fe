// src/app/admin/products/[id]/page.tsx
'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { productsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ChevronLeft,
  Edit,
  ExternalLink,
  ImageIcon,
  Package,
  Star,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Variant {
  id: number;
  name: string;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  display_order: number;
}

interface Product {
  id: number;
  category_id: number | null;
  category_name?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  unit: string;
  image_url: string | null;
  images: string[] | null;
  brand: string | null;
  masa_penyimpanan: string | null;
  jenis_kulit: string | null;
  referral_link: string | null;
  is_available: boolean;
  is_featured: boolean;
  rating: number | null;
  created_at: string;
  variants?: Variant[];
}

export default function AdminProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data.data);
    } catch {
      toast.error('Produk tidak ditemukan');
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Yakin ingin menghapus produk "${product.name}"?`)) return;

    setIsDeleting(true);
    try {
      await productsAPI.delete(product.id);
      toast.success('Produk berhasil dihapus');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!product) return null;

  const skinTypes = product.jenis_kulit
    ? product.jenis_kulit.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const gallery = Array.isArray(product.images) ? product.images : [];

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center cursor-pointer gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1 truncate">{product.slug}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Gambar Utama</h2>
            <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-xs">Belum ada gambar</span>
                </div>
              )}
            </div>

            {gallery.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Galeri ({gallery.length})</p>
                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((url, idx) => (
                    <div
                      key={url + idx}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Deskripsi</h2>
            {product.description ? (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-sm text-gray-400 italic">Belum ada deskripsi</p>
            )}
          </Card>

          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Varian ({product.variants.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                      <th className="py-2 pr-3 font-medium">Nama</th>
                      <th className="py-2 pr-3 font-medium">Harga</th>
                      <th className="py-2 pr-3 font-medium">Diskon</th>
                      <th className="py-2 pr-3 font-medium">Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id} className="border-b border-gray-50">
                        <td className="py-2 pr-3 text-gray-900">{v.name}</td>
                        <td className="py-2 pr-3 text-gray-700">{formatCurrency(Number(v.price))}</td>
                        <td className="py-2 pr-3 text-gray-700">
                          {v.discount_price ? formatCurrency(Number(v.discount_price)) : '-'}
                        </td>
                        <td className="py-2 pr-3 text-gray-700">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ketersediaan</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    product.is_available ? 'bg-pink-50 text-pink-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {product.is_available ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unggulan</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    product.is_featured ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {product.is_featured && <Star className="w-3 h-3" />}
                  {product.is_featured ? 'Ya' : 'Tidak'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.rating ? Number(product.rating).toFixed(1) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dibuat</span>
                <span className="text-sm text-gray-900">{formatDate(product.created_at)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Harga & Stok</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Harga</p>
                <p className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(product.discount_price || product.price))}
                </p>
                {product.discount_price && (
                  <p className="text-xs text-gray-400 line-through">{formatCurrency(Number(product.price))}</p>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Stok</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {product.stock} {product.unit}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Detail</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Kategori</dt>
                <dd className="text-gray-900">{product.category_name || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Brand</dt>
                <dd className="text-gray-900">{product.brand || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Masa Penyimpanan</dt>
                <dd className="text-gray-900">{product.masa_penyimpanan || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Jenis Kulit</dt>
                <dd>
                  {skinTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skinTypes.map((tipe) => (
                        <span
                          key={tipe}
                          className="px-2 py-0.5 text-xs bg-pink-50 text-pink-700 rounded-full border border-pink-100"
                        >
                          {tipe}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-900">-</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Link Referral</dt>
                <dd>
                  {product.referral_link ? (
                    <a
                      href={product.referral_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 hover:underline break-all"
                    >
                      <span className="truncate max-w-[200px]">{product.referral_link}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-gray-900">-</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
