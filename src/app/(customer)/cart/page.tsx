// src/app/(customer)/cart/page.tsx
'use client';

import Loader from '@/components/common/Loader';
import CartItem from '@/components/customer/CardItem';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export default function CartPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, subtotal, totalQuantity, fetchCart, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadCart = async () => {
      await fetchCart();
      setIsLoading(false);
    };

    loadCart();
  }, [isAuthenticated, router, fetchCart]);

  const handleClearCart = async () => {
    if (!confirm('Kosongkan keranjang?')) return;

    setIsClearing(true);
    try {
      await clearCart();
      toast.success('Keranjang dikosongkan');
    } catch (error) {
      toast.error('Gagal mengosongkan keranjang');
    } finally {
      setIsClearing(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      toast.error('Gagal update jumlah');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    const isConfirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus item ini?"
    );
  
    if (!isConfirmed) return;
  
    try {
      await removeItem(itemId);
      toast.success("Item berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus item");
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

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-6">Belum ada produk di keranjang</p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
              >
                Mulai Belanja
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    );
  }

  const shippingCost = 10000;
  const total = subtotal + shippingCost;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Keranjang</h1>
            <motion.p
              key={totalQuantity}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 mt-1"
            >
              {totalQuantity} item
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, color: '#dc2626' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearCart}
            disabled={isClearing}
            className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Kosongkan
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-3"
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  transition={{ delay: index * 0.05 }}
                >
                  <CartItem
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-20 bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan</h2>

              <div className="space-y-3 text-sm">
                <motion.div
                  key={subtotal}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between text-gray-600"
                >
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </motion.div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkir</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <hr className="border-gray-100" />
                <motion.div
                  key={total}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="flex justify-between"
                >
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-pink-600">{formatCurrency(total)}</span>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/checkout')}
                className="w-full cursor-pointer flex items-center justify-center gap-2 mt-5 px-4 py-3 text-pink-600 text-sm font-bold rounded-lg bg-pink-100 transition-colors"
              >
                Checkout
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <motion.div
                whileHover={{ color: '#111827' }}
              >
                <Link
                  href="/products"
                  className="block text-center text-sm text-gray-500 mt-3 transition-colors"
                >
                  Lanjut Belanja
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
