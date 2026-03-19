'use client';

import Loader from '@/components/common/Loader';
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getBySlug(params.slug);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Produk tidak ditemukan');
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-white"
      >
        <Loader size="lg" />
      </motion.div>
    );
  }

  if (!product) {
    return null;
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const finalPrice = hasDiscount ? product.discount_price : product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const subtotal = finalPrice * quantity;
  const isOutOfStock = !product.is_available || product.stock === 0;

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-sm mb-6"
        >
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            Beranda
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-900 transition-colors">
            Produk
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">{product.name}</span>
        </motion.nav>

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ x: -4 }}
          onClick={() => router.back()}
          className="flex cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </motion.button>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              {product.image_url && !imageError ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={product.image_url?.includes('localhost')}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl"
                  >
                    ✨
                  </motion.span>
                </div>
              )}

              {/* Discount Badge */}
              <AnimatePresence>
                {hasDiscount && (
                  <motion.span
                    initial={{ opacity: 0, x: -20, rotate: -10 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded"
                  >
                    -{discountPercentage}%
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Out of Stock */}
              <AnimatePresence>
                {isOutOfStock && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 flex items-center justify-center"
                  >
                    <span className="text-lg font-medium text-gray-500">Stok Habis</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Category */}
            {product.category_name && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500"
              >
                {product.category_name}
              </motion.span>
            )}

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 mb-4"
            >
              {product.name}
            </motion.h1>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 pb-6 border-b border-gray-100"
            >
              <div className="flex items-baseline gap-3">
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.55, type: 'spring' }}
                  className="text-2xl font-semibold text-pink-600"
                >
                  {formatCurrency(finalPrice)}
                </motion.span>
                {hasDiscount && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-gray-400 line-through"
                  >
                    {formatCurrency(product.price)}
                  </motion.span>
                )}
              </div>
              {product.unit && (
                <p className="text-sm text-gray-500 mt-1">per {product.unit}</p>
              )}
            </motion.div>

            {/* Stock */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-6"
            >
              <p className="text-sm text-gray-500">
                Stok: <span className="text-gray-900 font-medium">{product.stock} {product.unit}</span>
              </p>
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-2">Deskripsi</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </motion.div>
            )}

            {/* Ingredients - shown if description contains keyword */}
            {product.description && /kandungan|ingredients|komposisi/i.test(product.description) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62 }}
                className="mb-6 p-3 bg-gray-50 rounded-lg"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-1">Kandungan Utama</h3>
                <p className="text-xs text-gray-500">Lihat deskripsi produk untuk detail lengkap kandungan.</p>
              </motion.div>
            )}

            {/* How to Use hint */}
            {product.description && /cara penggunaan|cara pakai|how to use|petunjuk/i.test(product.description) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.64 }}
                className="mb-6 p-3 bg-gray-50 rounded-lg"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-1">Cara Penggunaan</h3>
                <p className="text-xs text-gray-500">Lihat deskripsi produk untuk petunjuk penggunaan.</p>
              </motion.div>
            )}

            {/* Quantity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Jumlah
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <motion.button
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <motion.input
                    key={quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= product.stock) {
                        setQuantity(value);
                      }
                    }}
                    disabled={isOutOfStock}
                    className="w-12 text-center text-sm font-medium text-gray-900 focus:outline-none"
                    min={1}
                    max={product.stock}
                  />
                  <motion.button
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <motion.p
                    key={subtotal}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="font-semibold text-gray-900"
                  >
                    {formatCurrency(subtotal)}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 bg-gray-100 text-black text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isAddingToCart ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
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
                {addedToCart ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
