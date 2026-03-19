// src/app/(customer)/checkout/page.tsx
'use client';

import Loader from '@/components/common/Loader';
import { ordersAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Loader2, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, subtotal, fetchCart, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    recipient_name: '',
    phone: '',
    shipping_address: '',
    customer_notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      await fetchCart();
      setIsLoading(false);
    };

    loadData();

    if (user) {
      setFormData((prev) => ({
        ...prev,
        recipient_name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user, router, fetchCart]);

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [isLoading, items, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipient_name) {
      newErrors.recipient_name = 'Nama penerima wajib diisi';
    }

    if (!formData.phone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }

    if (!formData.shipping_address) {
      newErrors.shipping_address = 'Alamat wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await ordersAPI.create({
        ...formData,
        shipping_cost: 10000,
      });

      const orderId = response.data.data.id;

      toast.success('Pesanan berhasil dibuat');
      await clearCart();
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
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

  const shippingCost = 10000;
  const total = subtotal + shippingCost;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
            Kembali ke Keranjang
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-2xl font-semibold text-gray-900 mb-6"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-6"
            >
              {/* Shipping Info */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-lg border border-gray-100 p-5"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Pengiriman</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Nama Penerima <span className="text-red-500">*</span>
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01, borderColor: '#10b981' }}
                        type="text"
                        value={formData.recipient_name}
                        onChange={(e) =>
                          setFormData({ ...formData, recipient_name: e.target.value })
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all ${
                          errors.recipient_name ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Nama lengkap"
                      />
                      <AnimatePresence>
                        {errors.recipient_name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.recipient_name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        No. Telepon <span className="text-red-500">*</span>
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01, borderColor: '#10b981' }}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all ${
                          errors.phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="08123456789"
                      />
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.phone}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01, borderColor: '#10b981' }}
                      value={formData.shipping_address}
                      onChange={(e) =>
                        setFormData({ ...formData, shipping_address: e.target.value })
                      }
                      rows={3}
                      className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none transition-all ${
                        errors.shipping_address ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                    />
                    <AnimatePresence>
                      {errors.shipping_address && (
                        <motion.p
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.shipping_address}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-lg border border-gray-100 p-5"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Catatan (Opsional)</h2>

                <motion.textarea
                  whileFocus={{ scale: 1.01, borderColor: '#10b981' }}
                  value={formData.customer_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none transition-all"
                  placeholder="Catatan: skin type, preferensi kemasan, dll"
                />
              </motion.div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-20 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-lg border border-gray-100 p-5"
                >
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>

                  {/* Items */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-gray-900">
                          {formatCurrency((item.discount_price || item.price) * item.quantity)}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-between text-gray-600"
                    >
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 }}
                      className="flex justify-between text-gray-600"
                    >
                      <span>Ongkir</span>
                      <span>{formatCurrency(shippingCost)}</span>
                    </motion.div>
                    <hr className="border-gray-100" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring' }}
                      className="flex justify-between"
                    >
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-pink-600">{formatCurrency(total)}</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-pink-50 rounded-lg border border-pink-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pink-800">
                        Pembayaran via QRIS
                      </p>
                      <p className="text-xs text-pink-600 mt-0.5">
                        Scan QR code setelah pesanan dibuat
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                        Memproses...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Buat Pesanan
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </main>
  );
}
