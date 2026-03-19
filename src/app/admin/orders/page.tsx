// src/app/admin/orders/page.tsx
'use client';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { ordersAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
} from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filterStatus, filterPayment]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.adminGetAll({
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus || undefined,
        payment_status: filterPayment || undefined,
        search: searchQuery || undefined,
      });
      setOrders(response.data.data || []);
      // Backend might return pagination differently
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        setPagination(prev => ({
          ...prev,
          total: response.data.data?.length || 0,
          totalPages: 1,
        }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const statusTabs = [
    { value: '', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const paymentOptions = [
    { value: '', label: 'Semua Pembayaran' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'paid', label: 'Lunas' },
    { value: 'failed', label: 'Gagal' },
  ];

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between p-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pesanan
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 text-sm rounded-lg ${
                page === pagination.page
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Kelola Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total} pesanan total</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-4">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilterStatus(tab.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === tab.value
                  ? 'bg-pink-600 text-white border border-pink-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Payment Filter */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari order ID atau nama customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </div>
            </form>
            <select
              value={filterPayment}
              onChange={(e) => {
                setFilterPayment(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 text-sm border cursor-pointer border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      {orders.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Status Order
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Status Bayar
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getOrderStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium"
                      >
                        Detail
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </Card>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Tidak ada pesanan"
          description={
            searchQuery
              ? 'Tidak ada pesanan yang cocok dengan pencarian'
              : filterStatus
              ? `Tidak ada pesanan dengan status ${filterStatus}`
              : 'Belum ada pesanan masuk'
          }
        />
      )}
    </div>
  );
}
