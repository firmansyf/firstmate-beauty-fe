// src/app/(customer)/cart/page.tsx
'use client';

import Loader from '@/components/common/Loader';
import CartItem from '@/components/customer/CardItem';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useShallow } from 'zustand/react/shallow';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, subtotal, totalQuantity, fetchCart, updateQuantity, removeItem, clearCart } =
    useCartStore(useShallow((s) => ({
      items: s.items,
      subtotal: s.subtotal,
      totalQuantity: s.totalQuantity,
      fetchCart: s.fetchCart,
      updateQuantity: s.updateQuantity,
      removeItem: s.removeItem,
      clearCart: s.clearCart,
    })));
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
    const isConfirmed = window.confirm('Apakah kamu yakin ingin menghapus item ini?');
    if (!isConfirmed) return;

    try {
      await removeItem(itemId);
      toast.success('Item berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus item');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-6">Belum ada produk di keranjang</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              Mulai Belanja
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Keranjang</h1>
            <p className="text-sm text-gray-500 mt-1">{totalQuantity} item</p>
          </div>
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Kosongkan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkir</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-pink-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full cursor-pointer flex items-center justify-center gap-2 mt-5 px-4 py-3 text-pink-600 text-sm font-bold rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/products"
                className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-3 transition-colors"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
