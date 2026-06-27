'use client';

import RelatedProducts from '@/components/customer/RelatedProducts';
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DOMPurify from 'isomorphic-dompurify';

const ProductDetailSkeleton = () => (
  <main className="bg-white min-h-screen pb-8">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 bg-gray-100 animate-pulse rounded w-14" />
        <span className="text-gray-200">/</span>
        <div className="h-3 bg-gray-100 animate-pulse rounded w-14" />
        <span className="text-gray-200">/</span>
        <div className="h-3 bg-gray-200 animate-pulse rounded w-32" />
      </div>

      <div className="h-4 bg-gray-100 animate-pulse rounded w-20 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />

        <div>
          <div className="h-3 bg-gray-100 animate-pulse rounded w-24 mb-3" />
          <div className="h-7 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />
          <div className="h-7 bg-gray-200 animate-pulse rounded w-1/2 mb-5" />

          <div className="pb-6 mb-6 border-b border-gray-100 space-y-2">
            <div className="h-7 bg-gray-200 animate-pulse rounded w-40" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
          </div>

          <div className="space-y-2 mb-6">
            <div className="h-3 bg-gray-100 animate-pulse rounded w-28" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-32" />
          </div>

          <div className="space-y-2 mb-6">
            <div className="h-3 bg-gray-200 animate-pulse rounded w-20 mb-2" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-full" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-full" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-4/5" />
          </div>

          <div className="mb-6">
            <div className="h-3 bg-gray-200 animate-pulse rounded w-16 mb-2" />
            <div className="flex items-center gap-4">
              <div className="h-10 w-28 bg-gray-100 animate-pulse rounded-lg" />
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-100 animate-pulse rounded w-16" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
              </div>
            </div>
          </div>

          <div className="h-11 bg-gray-200 animate-pulse rounded-lg w-full" />
        </div>
      </div>
    </div>
  </main>
);

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getBySlug(slug);
      const data = response.data.data;
      setProduct(data);
      const variants = Array.isArray(data?.variants) ? data.variants : [];
      if (variants.length > 0) {
        // Default to first in-stock variant, fallback to first variant
        const inStock = variants.find((v: any) => Number(v.stock) > 0);
        setSelectedVariantId((inStock || variants[0]).id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Produk tidak ditemukan');
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const variants: any[] = Array.isArray(product?.variants) ? product.variants : [];
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || null;
  const effectiveStock = selectedVariant
    ? Number(selectedVariant.stock)
    : Number(product?.stock || 0);

  // Reset quantity when variant changes or stock shrinks
  useEffect(() => {
    if (quantity > effectiveStock) {
      setQuantity(Math.max(1, effectiveStock || 1));
    }
  }, [effectiveStock]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= effectiveStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariantId) {
      toast.error('Silakan pilih varian terlebih dahulu');
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity, { variantId: selectedVariantId });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  // Effective price/discount react to selected variant
  const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const baseDiscount = selectedVariant
    ? selectedVariant.discount_price !== null && selectedVariant.discount_price !== undefined
      ? Number(selectedVariant.discount_price)
      : null
    : product.discount_price !== null && product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;
  const hasDiscount = baseDiscount !== null && baseDiscount < basePrice;
  const finalPrice = hasDiscount ? baseDiscount! : basePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((basePrice - baseDiscount!) / basePrice) * 100)
    : 0;
  const subtotal = finalPrice * quantity;
  const isOutOfStock = !product.is_available || effectiveStock === 0;

  const galleryImages: string[] = [
    selectedVariant?.image_url,
    product.image_url,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);
  const displayedImage = activeImage || galleryImages[0] || null;
  const currentIndex = displayedImage ? galleryImages.indexOf(displayedImage) : -1;
  const hasMultiple = galleryImages.length > 1;

  const goToImage = (index: number) => {
    if (!galleryImages.length) return;
    const next = (index + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[next]);
    setImageError(false);
  };

  const VariantSelector = () =>
    variants.length > 0 ? (
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Varian
          {selectedVariant && (
            <span className="text-gray-500 font-normal ml-2">{selectedVariant.name}</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {variants.map((v: any) => {
            const isActive = selectedVariantId === v.id;
            const variantOutOfStock = Number(v.stock) === 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                disabled={variantOutOfStock}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                } ${variantOutOfStock ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
              >
                {v.name}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  const QuantityStepper = () => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-900 mb-2">Jumlah</label>
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= effectiveStock) setQuantity(value);
            }}
            disabled={isOutOfStock}
            className="w-12 text-center text-sm font-medium text-gray-900 focus:outline-none"
            min={1}
            max={effectiveStock}
          />
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= effectiveStock || isOutOfStock}
            className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const AddToCartButton = ({ className = '' }: { className?: string }) => (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAddingToCart}
      className={`cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-700 active:scale-95 transition-all ${className}`}
    >
      <AnimatePresence mode="wait">
        {isAddingToCart ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
          />
        ) : addedToCart ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ShoppingBag className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      {isOutOfStock ? 'Stok Habis' : addedToCart ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
    </button>
  );

  return (
    <main className="bg-white min-h-screen pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm mb-6 min-w-0">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors shrink-0">
            Beranda
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-900 transition-colors shrink-0">
            Produk
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <span
            className="text-gray-900 truncate min-w-0 max-w-[180px] sm:max-w-xs md:max-w-sm"
            title={product.name}
          >
            {product.name}
          </span>
        </nav>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </button>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Image */}
          <div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
              {displayedImage && !imageError ? (
                <Image
                  src={displayedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">✨</span>
                </div>
              )}

              {hasDiscount && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                  -{discountPercentage}%
                </span>
              )}

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => goToImage(currentIndex - 1)}
                    aria-label="Gambar sebelumnya"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToImage(currentIndex + 1)}
                    aria-label="Gambar berikutnya"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded">
                    {currentIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-500">Stok Habis</span>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {galleryImages.map((url, idx) => {
                  const isActive = displayedImage === url;
                  return (
                    <button
                      key={url + idx}
                      type="button"
                      onClick={() => {
                        setActiveImage(url);
                        setImageError(false);
                      }}
                      className={`relative w-20 h-20 flex-shrink-0 snap-start bg-gray-100 rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${
                        isActive ? 'border-pink-500' : 'border-transparent hover:border-gray-300'
                      }`}
                      aria-label={`Lihat gambar ${idx + 1}`}
                    >
                      <Image src={url} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 text-sm">
              {product.category_name && (
                <span className="text-gray-500">{product.category_name}</span>
              )}
              {product.category_name && product.brand && (
                <span className="text-gray-300">•</span>
              )}
              {product.brand && (
                <span className="text-pink-600 font-medium">{product.brand}</span>
              )}
            </div>

            <h1
              className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mt-1 mb-4 leading-snug break-words line-clamp-3"
              title={product.name}
            >
              {product.name}
            </h1>

            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-pink-600">
                  {formatCurrency(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              {product.unit && (
                <p className="text-sm text-gray-500 mt-1">per {product.unit}</p>
              )}
            </div>

            {/* Variants + Quantity — mobile only (shown right under title/price) */}
            <div className="lg:hidden">
              <VariantSelector />
              <QuantityStepper />
            </div>

            <div className="mb-6 space-y-1">
              <p className="text-sm text-gray-500">
                Stok: <span className="text-gray-900 font-medium">{effectiveStock}</span>
              </p>
              <p className="text-sm text-gray-500">
                Satuan: <span className="text-gray-900 font-medium">{product.unit}</span>
              </p>
              {product.brand && (
                <p className="text-sm text-gray-500">
                  Brand: <span className="text-gray-900 font-medium">{product.brand}</span>
                </p>
              )}
              {product.masa_penyimpanan && (
                <p className="text-sm text-gray-500">
                  Masa Penyimpanan: <span className="text-gray-900 font-medium">{product.masa_penyimpanan}</span>
                </p>
              )}
            </div>

            {product.jenis_kulit && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Cocok untuk Jenis Kulit</h3>
                <div className="flex flex-wrap gap-2">
                  {String(product.jenis_kulit)
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                    .map((tipe: string) => (
                      <span
                        key={tipe}
                        className="px-3 py-1 text-xs bg-pink-50 text-pink-700 border border-pink-100 rounded-full"
                      >
                        {tipe}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Deskripsi</h3>
                {/<[a-z][\s\S]*>/i.test(product.description) ? (
                  <div
                    className="rich-text-content text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                  />
                ) : (
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                )}
              </div>
            )}

            {product.description && /kandungan|ingredients|komposisi/i.test(product.description) && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-1">Kandungan Utama</h3>
                <p className="text-xs text-gray-500">Lihat deskripsi produk untuk detail lengkap kandungan.</p>
              </div>
            )}

            {product.description && /cara penggunaan|cara pakai|how to use|petunjuk/i.test(product.description) && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-1">Cara Penggunaan</h3>
                <p className="text-xs text-gray-500">Lihat deskripsi produk untuk petunjuk penggunaan.</p>
              </div>
            )}

            {/* Variants — desktop only (mobile version is above the details) */}
            <div className="hidden lg:block">
              <VariantSelector />
            </div>

            {/* Quantity — desktop only */}
            <div className="hidden lg:block">
              <QuantityStepper />
            </div>

            {/* Add to Cart — desktop only (mobile uses fixed bottom bar) */}
            <div className="hidden lg:block">
              <AddToCartButton className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="border-t border-gray-100 mt-8">
        <RelatedProducts currentSlug={slug} />
      </div>

      {/* Fixed bottom bar — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
        <AddToCartButton className="w-full" />
      </div>
    </main>
  );
}
