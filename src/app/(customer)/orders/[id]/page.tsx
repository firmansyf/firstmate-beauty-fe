// src/app/(customer)/orders/[id]/page.tsx
'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { ordersAPI, refundsAPI, settingsAPI, uploadAPI } from '@/lib/api';
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
  QrCode,
  Truck,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, use, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  variant_name?: string | null;
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
  payment_proof_url?: string | null;
  payment_proof_uploaded_at?: string | null;
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
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [showQrZoom, setShowQrZoom] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [ewalletPhone, setEwalletPhone] = useState('');
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [isConfirmingReceived, setIsConfirmingReceived] = useState(false);

  useEffect(() => {
    fetchOrder();
    settingsAPI
      .getPayment()
      .then((res) => setQrisUrl(res.data.data?.qris_image_url || null))
      .catch(() => setQrisUrl(null));
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

  const handleConfirmReceived = async () => {
    if (!order) return;

    if (!confirm('Konfirmasi bahwa Anda telah menerima pesanan ini?')) {
      return;
    }

    setIsConfirmingReceived(true);
    try {
      await ordersAPI.confirmReceived(order.id);
      toast.success('Terima kasih! Pesanan dikonfirmasi diterima.');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengkonfirmasi pesanan');
    } finally {
      setIsConfirmingReceived(false);
    }
  };

  const needsPayment =
    order?.status !== 'cancelled' &&
    (order?.payment_status === 'pending' || order?.payment_status === 'waiting_confirmation');
  const canCancel =
    order?.status === 'pending' &&
    (order?.payment_status === 'pending' || order?.payment_status === 'waiting_confirmation');
  const canRequestRefund = order?.status === 'shipped' && order?.payment_status === 'paid';
  const canConfirmReceived = order?.status === 'shipped';

  const handleProofUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploadingProof(true);
    try {
      const uploadRes = await uploadAPI.uploadPaymentProof(file);
      const url = uploadRes.data.data.url;
      await ordersAPI.uploadPaymentProof(order.id, { payment_proof_url: url });
      toast.success('Bukti pembayaran terkirim. Menunggu verifikasi admin.');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim bukti pembayaran');
    } finally {
      setIsUploadingProof(false);
      if (proofInputRef.current) proofInputRef.current.value = '';
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
            {/* QRIS Payment */}
            {needsPayment && (
              <Card className="p-5 border-pink-200">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-pink-600" />
                  <h2 className="text-sm font-semibold text-gray-900">Pembayaran QRIS</h2>
                </div>

                {order.payment_status === 'waiting_confirmation' ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800">
                        Bukti pembayaran sedang diverifikasi admin
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Kami akan memproses pesanan Anda setelah pembayaran dikonfirmasi.
                      </p>
                    </div>
                    {order.payment_proof_url && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Bukti yang Anda unggah:</p>
                        <div className="relative w-40 h-52 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={order.payment_proof_url}
                            alt="Bukti pembayaran"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => proofInputRef.current?.click()}
                      disabled={isUploadingProof}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium disabled:opacity-50"
                    >
                      {isUploadingProof ? 'Mengunggah...' : 'Ganti bukti pembayaran'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Scan kode QRIS di bawah dengan aplikasi e-wallet / m-banking Anda, lalu bayar
                      sejumlah <span className="font-semibold text-pink-600">{formatCurrency(order.total)}</span>.
                    </p>

                    <div className="flex flex-col items-center">
                      {qrisUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowQrZoom(true)}
                            className="relative w-64 h-64 bg-white rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            title="Klik untuk memperbesar"
                          >
                            <Image src={qrisUrl} alt="QRIS" fill className="object-contain p-2" unoptimized />
                          </button>
                          <p className="text-xs text-gray-400 mt-2">Klik kode QRIS untuk memperbesar</p>
                        </>
                      ) : (
                        <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center px-4">
                          <QrCode className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400">
                            QRIS belum tersedia. Silakan hubungi admin.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-pink-50 border border-pink-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600">
                        Setelah membayar, unggah bukti pembayaran (screenshot) agar pesanan Anda
                        diproses oleh admin.
                      </p>
                    </div>

                    <button
                      onClick={() => proofInputRef.current?.click()}
                      disabled={isUploadingProof}
                      className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingProof ? (
                        <>
                          <Loader size="sm" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Unggah Bukti Pembayaran
                        </>
                      )}
                    </button>
                  </div>
                )}

                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProofUpload}
                  className="hidden"
                />
              </Card>
            )}

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
                      {item.variant_name && (
                        <p className="text-xs text-gray-500 mt-0.5">Varian: <span className="text-gray-700 font-medium">{item.variant_name}</span></p>
                      )}
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
            {(canCancel || canRequestRefund || canConfirmReceived) && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Aksi</h3>
                <div className="space-y-2">
                  {canConfirmReceived && (
                    <>
                      <button
                        onClick={handleConfirmReceived}
                        disabled={isConfirmingReceived}
                        className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isConfirmingReceived ? 'Memproses...' : 'Pesanan Diterima'}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Tekan jika pesanan sudah Anda terima
                      </p>
                    </>
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

      {/* QRIS Zoom Lightbox */}
      {showQrZoom && qrisUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-zoom-out"
          onClick={() => setShowQrZoom(false)}
        >
          <button
            type="button"
            onClick={() => setShowQrZoom(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative w-full max-w-2xl aspect-square max-h-[90vh] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={qrisUrl} alt="QRIS" fill className="object-contain p-4" unoptimized />
          </div>
        </div>
      )}
    </main>
  );
}
