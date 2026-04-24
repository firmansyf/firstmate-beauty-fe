// src/app/(customer)/profile/page.tsx
'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import FeedbackModal from '@/components/customer/FeedbackModal';
import { authAPI, ordersAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  ChevronRight,
  LogOut,
  Mail,
  MessageSquarePlus,
  Package,
  Phone,
  ShoppingBag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStats>({ total: 0, pending: 0, completed: 0 });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrderStats();
  }, [isAuthenticated]);

  const fetchOrderStats = async () => {
    try {
      const response = await ordersAPI.getUserOrders();
      const orders = response.data.data || [];

      setOrderStats({
        total: orders.length,
        pending: orders.filter((o: any) => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length,
        completed: orders.filter((o: any) => o.status === 'delivered').length,
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      logout();
      toast.success('Berhasil keluar');
      router.push('/');
    }
  };

  if (isLoading || !user) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader size="lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Profil Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola informasi profil Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Profile Info */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Nomor Telepon</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.phone || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Stats */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Statistik Pesanan</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Pesanan</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Dalam Proses</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-600">{orderStats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">Selesai</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Links */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Menu</h3>
              <div className="space-y-1">
                <Link
                  href="/orders"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Pesanan Saya</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Keranjang</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquarePlus className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Kirim Feedback</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-600">Keluar</span>
                  </div>
                </button>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-5 bg-pink-50 border-pink-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Hubungi kami jika ada pertanyaan atau kendala.
              </p>
              <a
                href="https://wa.me/6285117176837"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-pink-600 text-white text-sm font-medium text-center rounded-lg hover:bg-pink-700 transition-colors"
              >
                Chat WhatsApp
              </a>
            </Card>
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
