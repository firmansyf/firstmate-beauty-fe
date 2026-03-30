// src/app/(customer)/orders/[id]/page.tsx
'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { ordersAPI, refundsAPI, paymentAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
} from '@/lib/utils';
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  MapPin,
  Package,
  Phone,
  Truck,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  recipient_name: string;
  phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  customer_notes?: string;
  created_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  items: OrderItem[];
}

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [ewalletPhone, setEwalletPhone] = useState('');
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getDetail(parseInt(id));
      setOrder(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Silakan login terlebih dahulu');
        router.push('/login');
      } else {
        toast.error('Pesanan tidak ditemukan');
        router.push('/orders');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!confirm('Yakin ingin membatalkan pesanan ini?')) {
      return;
    }

    setIsCancelling(true);
    try {
      await ordersAPI.cancel(order.id);
      toast.success('Pesanan berhasil dibatalkan');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan');
    } finally {
      setIsCancelling(false);
    }
  };

  const canPay = order?.status === 'pending' && order?.payment_status === 'pending';
  const canCancel = order?.status === 'pending' && order?.payment_status === 'pending';
  const canRequestRefund = order?.status === 'shipped' && order?.payment_status === 'paid';

  const handlePayNow = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      const tokenResponse = await paymentAPI.createSnapToken(order.id);
      const snapToken = tokenResponse.data.data.snap_token;

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          toast.success('Pembayaran berhasil!');
          // Optimistically hide button immediately
          setOrder((prev) => prev ? { ...prev, payment_status: 'paid' } : prev);
          // Sync actual status from Midtrans to DB, then refresh
          try {
            await paymentAPI.checkStatus(order.id);
          } catch {}
          fetchOrder();
        },
        onPending: () => {
          toast('Pembayaran pending, cek status pesanan Anda', { icon: '⏳' });
          fetchOrder();
        },
        onError: () => {
          toast.error('Pembayaran gagal, silakan coba lagi');
        },
        onClose: () => {
          toast('Pembayaran ditutup', { icon: 'ℹ️' });
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuka halaman pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!order || !refundReason || !ewalletPhone) {
      toast.error('Alasan dan nomor e-wallet wajib diisi');
      return;
    }

    if (ewalletPhone.length < 10) {
      toast.error('Nomor e-wallet minimal 10 digit');
      return;
    }

    setIsRequestingRefund(true);
    try {
      await refundsAPI.create({
        order_id: order.id,
        reason: refundReason,
        ewallet_phone: ewalletPhone,
      });
      toast.success('Permintaan refund berhasil diajukan');
      setShowRefundModal(false);
      setRefundReason('');
      setEwalletPhone('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengajukan refund');
    } finally {
      setIsRequestingRefund(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusTimeline = () => {
    if (!order) return [];

    const timeline = [
      {
        status: 'pending',
        label: 'Pesanan Dibuat',
        date: order.created_at,
        active: true,
      },
    ];

    if (order.confirmed_at) {
      timeline.push({
        status: 'confirmed',
        label: 'Dikonfirmasi',
        date: order.confirmed_at,
        active: true,
      });
    }

    if (order.shipped_at) {
      timeline.push({
        status: 'shipped',
        label: 'Dikirim',
        date: order.shipped_at,
        active: true,
      });
    }

    if (order.delivered_at) {
      timeline.push({
        status: 'delivered',
        label: 'Selesai',
        date: order.delivered_at,
        active: true,
      });
    }

    if (order.cancelled_at) {
      timeline.push({
        status: 'cancelled',
        label: 'Dibatalkan',
        date: order.cancelled_at,
        active: true,
      });
    }

    return timeline;
  };

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

  if (!order) return null;

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status Timeline */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Status Pesanan</h2>
              <div className="space-y-4">
                {getStatusTimeline().map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.status === 'cancelled' ? 'bg-red-500' : 'bg-pink-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Item Pesanan</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.product_name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">Catatan: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-pink-600">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order cancelled */}
            {order.status === 'cancelled' && (
              <Card className="p-5 bg-red-50 border border-red-200">
                <p className="text-red-700 font-medium">Order Dibatalkan</p>
                <p className="text-red-600 text-sm mt-1">
                  Pembayaran tidak dapat dilakukan untuk order yang telah dibatalkan.
                </p>
              </Card>
            )}

            {/* Customer Notes */}
            {order.customer_notes && (
              <Card className="p-5 bg-pink-50 border-pink-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Catatan Anda</h3>
                <p className="text-sm text-gray-600">{order.customer_notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Shipping Info */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Alamat Pengiriman</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.recipient_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.shipping_address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{order.phone}</p>
                </div>
              </div>
            </Card>

            {/* Payment Summary */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({order.items.length} item)</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-pink-600">{formatCurrency(order.total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status Pembayaran</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                    {getPaymentStatusText(order.payment_status)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            {(canPay || canCancel || canRequestRefund) && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Aksi</h3>
                <div className="space-y-2">
                  {canPay && (
                    <button
                      onClick={handlePayNow}
                      disabled={isPaying}
                      className="w-full cursor-pointer px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                      {isPaying ? 'Memuat...' : 'Bayar Sekarang'}
                    </button>
                  )}
                  {canCancel && (
                    <>
                      <button
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                        className="w-full px-4 cursor-pointer py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Pesanan hanya dapat dibatalkan sebelum dikonfirmasi
                      </p>
                    </>
                  )}
                  {canRequestRefund && (
                    <>
                      <button
                        onClick={() => setShowRefundModal(true)}
                        className="w-full cursor-pointer px-4 py-2 bg-orange-50 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        Ajukan Refund
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Ajukan refund jika produk belum diterima
                      </p>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Order Date */}
            <Card className="p-5 bg-gray-50">
              <p className="text-xs text-gray-500">Tanggal Pemesanan</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatDateTime(order.created_at)}
              </p>
            </Card>
          </div>
        </div>

        {/* Back to Orders */}
        <div className="mt-8 text-center">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajukan Refund</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Refund <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Jelaskan alasan pengajuan refund..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor E-Wallet <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={ewalletPhone}
                  onChange={(e) => setEwalletPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nomor telepon e-wallet (GoPay, OVO, Dana, dll) untuk transfer refund
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                <p className="text-xs text-orange-700">
                  Refund akan diproses setelah disetujui oleh admin. Dana akan ditransfer ke nomor e-wallet yang Anda masukkan.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                    setEwalletPhone('');
                  }}
                  className="flex-1 cursor-pointer px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRefundRequest}
                  disabled={isRequestingRefund || !refundReason || !ewalletPhone}
                  className="flex-1 cursor-pointer px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingRefund ? 'Mengirim...' : 'Ajukan Refund'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
