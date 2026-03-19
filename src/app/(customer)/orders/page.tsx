// src/app/(customer)/orders/page.tsx
'use client';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { ordersAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
} from '@/lib/utils';
import { ChevronRight, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  items: Array<{
    id: number;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
  }>;
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : undefined;
      const response = await ordersAPI.getUserOrders(params);
      setOrders(response.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Silakan login terlebih dahulu');
        router.push('/login');
      } else {
        toast.error('Gagal memuat pesanan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statusFilters = [
    { value: '', label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  if (isLoading) {
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
      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 px-4 md:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Pesanan Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Lihat dan kelola semua pesanan Anda</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 px-4 md:px-0 scrollbar-hide">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filterStatus === filter.value
                  ? 'text-pink-800 font-bold border border-gray-200 bg-pink-100'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="flex flex-col gap-y-4 px-4 md:px-0">
            {orders.map((order) => (
              <Link href={`/orders/${order.id}`} key={order.id}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-2 mb-3">
                    {(order.items || []).slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-500 font-medium">
                          +{order.items!.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.items?.length || 0} item
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-pink-600">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="Belum ada pesanan"
            description={
              filterStatus
                ? 'Tidak ada pesanan dengan status ini'
                : 'Anda belum memiliki pesanan, mulai belanja sekarang!'
            }
            actionLabel={!filterStatus ? 'Mulai Belanja' : undefined}
            onAction={!filterStatus ? () => router.push('/products') : undefined}
          />
        )}
      </div>
    </main>
  );
}
