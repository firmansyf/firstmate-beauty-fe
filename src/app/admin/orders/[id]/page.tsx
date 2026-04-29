// src/app/admin/orders/[id]/page.tsx
'use client';

import Card from '@/components/common/Card';
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
import { ChevronLeft, MapPin, MessageSquare, Package, Phone, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.adminGetDetail(parseInt(params.id));
      setOrder(response.data.data);
      setNewStatus(response.data.data.status);
      setNewPaymentStatus(response.data.data.payment_status);
      setAdminNotes(response.data.data.admin_notes || '');
    } catch {
      toast.error('Pesanan tidak ditemukan');
      router.push('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const hasStatusChange = newStatus !== order.status;
    const hasPaymentChange = newPaymentStatus !== order.payment_status;
    const hasNotesChange = adminNotes !== (order.admin_notes || '');

    if (!hasStatusChange && !hasPaymentChange && !hasNotesChange) {
      toast.error('Tidak ada perubahan');
      return;
    }

    const changes = [];
    if (hasStatusChange) changes.push(`Status: ${getOrderStatusText(newStatus)}`);
    if (hasPaymentChange) changes.push(`Pembayaran: ${getPaymentStatusText(newPaymentStatus)}`);
    if (hasNotesChange) changes.push('Catatan admin');

    if (!confirm(`Yakin ingin mengubah:\n${changes.join('\n')}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await ordersAPI.adminUpdateStatus(order.id, {
        status: newStatus,
        payment_status: newPaymentStatus,
        admin_notes: adminNotes,
      });
      toast.success('Pesanan berhasil diupdate');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal update pesanan');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!order) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Menunggu Pembayaran' },
    { value: 'paid', label: 'Sudah Dibayar' },
    { value: 'failed', label: 'Gagal' },
    { value: 'refunded', label: 'Refund' },
  ];

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

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Detail Pesanan</h1>
          <p className="text-sm text-gray-500 mt-1">#{order.order_number}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Dibuat pada</p>
          <p className="text-sm font-medium text-gray-900">{formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Update */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Update Pesanan</h2>

            {/* Current Status Display */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status Pesanan Saat Ini</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusText(order.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status Pembayaran Saat Ini</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                  {getPaymentStatusText(order.payment_status)}
                </span>
              </div>
            </div>

            {/* Status Dropdowns */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status Pesanan
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Catatan Admin (Internal)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Tambahkan catatan internal untuk pesanan ini..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className="w-full cursor-pointer px-4 py-2 border border-gray-200 bg-gray-100 text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </Card>

          {/* Order Items */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Item Pesanan</h2>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.product_name}</h3>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-pink-600">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Notes */}
          {order.customer_notes && (
            <Card className="p-5 bg-pink-50 border-pink-100">
              <div className="flex gap-3">
                <MessageSquare className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Catatan Customer</h3>
                  <p className="text-sm text-gray-600">{order.customer_notes}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Customer Info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Customer</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Nama</p>
                  <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Telepon</p>
                  <p className="text-sm font-medium text-gray-900">{order.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Alamat Pengiriman</h2>
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">{order.recipient_name}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Summary */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkir</span>
                <span>{formatCurrency(order.shipping_cost)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-pink-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {order.whatsapp_number && (
                <a
                  href={`https://wa.me/${order.whatsapp_number.replace(/\D/g, '')}?text=Halo ${order.customer_name}, terima kasih telah memesan di FirstMate Beauty!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-3 py-2 bg-pink-600 text-white text-sm text-center rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Chat via WhatsApp
                </a>
              )}
              <a
                href={`tel:${order.phone}`}
                className="block w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm text-center rounded-lg hover:bg-gray-200 transition-colors"
              >
                Telepon Customer
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
