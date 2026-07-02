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
import { Check, ChevronLeft, ExternalLink, MapPin, MessageSquare, Package, Phone, Plus, Trash2, Truck, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [shipments, setShipments] = useState<Array<{ product_name: string; tracking_number: string; tracking_url: string }>>([]);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const shipmentsFromOrder = (data: any) =>
    (data.shipments || []).map((s: any) => ({
      product_name: s.product_name || '',
      tracking_number: s.tracking_number || '',
      tracking_url: s.tracking_url || '',
    }));

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.adminGetDetail(parseInt(params.id));
      setOrder(response.data.data);
      setNewStatus(response.data.data.status);
      setNewPaymentStatus(response.data.data.payment_status);
      setAdminNotes(response.data.data.admin_notes || '');
      setShipments(shipmentsFromOrder(response.data.data));
    } catch {
      toast.error('Pesanan tidak ditemukan');
      router.push('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const addShipment = () => {
    setShipments((prev) => [...prev, { product_name: '', tracking_number: '', tracking_url: '' }]);
  };

  const updateShipment = (index: number, patch: Partial<{ product_name: string; tracking_number: string; tracking_url: string }>) => {
    setShipments((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeShipment = (index: number) => {
    setShipments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateStatus = async () => {
    const hasStatusChange = newStatus !== order.status;
    const hasPaymentChange = newPaymentStatus !== order.payment_status;
    const hasNotesChange = adminNotes !== (order.admin_notes || '');
    const hasShipmentsChange = JSON.stringify(shipments) !== JSON.stringify(shipmentsFromOrder(order));

    if (!hasStatusChange && !hasPaymentChange && !hasNotesChange && !hasShipmentsChange) {
      toast.error('Tidak ada perubahan');
      return;
    }

    const changes = [];
    if (hasStatusChange) changes.push(`Status: ${getOrderStatusText(newStatus)}`);
    if (hasPaymentChange) changes.push(`Pembayaran: ${getPaymentStatusText(newPaymentStatus)}`);
    if (hasNotesChange) changes.push('Catatan admin');
    if (hasShipmentsChange) changes.push('Info Resi/Pengiriman');

    if (!confirm(`Yakin ingin mengubah:\n${changes.join('\n')}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await ordersAPI.adminUpdateStatus(order.id, {
        status: newStatus,
        payment_status: newPaymentStatus,
        admin_notes: adminNotes,
        shipments,
      });
      toast.success('Pesanan berhasil diupdate');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal update pesanan');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPayment = async (approved: boolean) => {
    const label = approved ? 'menyetujui (Sudah Dibayar)' : 'menolak';
    if (!confirm(`Yakin ingin ${label} pembayaran pesanan ini?`)) return;

    setIsVerifying(true);
    try {
      await ordersAPI.adminUpdateStatus(order.id, {
        payment_status: approved ? 'paid' : 'pending',
        ...(approved ? { status: order.status === 'pending' ? 'confirmed' : order.status } : {}),
      });
      toast.success(approved ? 'Pembayaran dikonfirmasi' : 'Pembayaran ditolak');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memverifikasi pembayaran');
    } finally {
      setIsVerifying(false);
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
    { value: 'waiting_confirmation', label: 'Menunggu Verifikasi' },
    { value: 'paid', label: 'Sudah Dibayar' },
    { value: 'expired', label: 'Kedaluwarsa' },
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

            {/* Tracking Info */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  Info Resi / Pengiriman
                </label>
                <button
                  type="button"
                  onClick={addShipment}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Resi
                </button>
              </div>

              {shipments.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-xs text-gray-500">Belum ada info resi. Klik &quot;Tambah Resi&quot; untuk menambahkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shipments.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start p-3 border border-gray-200 rounded-lg">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-xs text-gray-600 mb-1">Nama Produk</label>
                        <input
                          type="text"
                          value={s.product_name}
                          onChange={(e) => updateShipment(idx, { product_name: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="Nama produk"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">No. Resi</label>
                        <input
                          type="text"
                          value={s.tracking_number}
                          onChange={(e) => updateShipment(idx, { tracking_number: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="Nomor resi"
                        />
                      </div>
                      <div className="col-span-10 sm:col-span-4">
                        <label className="block text-xs text-gray-600 mb-1">Link Tracker Resi</label>
                        <input
                          type="url"
                          value={s.tracking_url}
                          onChange={(e) => updateShipment(idx, { tracking_url: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeShipment(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer mt-5"
                          aria-label="Hapus resi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    {item.variant_name && (
                      <p className="text-xs text-gray-500">Varian: <span className="text-gray-700 font-medium">{item.variant_name}</span></p>
                    )}
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

          {/* Payment Proof */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Bukti Pembayaran (QRIS)</h2>
            {order.payment_proof_url ? (
              <div className="space-y-4">
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-48 h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image
                    src={order.payment_proof_url}
                    alt="Bukti pembayaran"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </a>
                {order.payment_proof_uploaded_at && (
                  <p className="text-xs text-gray-500">
                    Diunggah: {formatDateTime(order.payment_proof_uploaded_at)}
                  </p>
                )}

                {order.payment_status !== 'paid' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyPayment(true)}
                      disabled={isVerifying}
                      className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Setujui
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(false)}
                      disabled={isVerifying}
                      className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Customer belum mengunggah bukti pembayaran.
              </p>
            )}
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

          {/* Tracking Info */}
          {order.shipments?.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Info Pengiriman</h2>
              <div className="space-y-4">
                {order.shipments.map((s: any, idx: number) => (
                  <div key={s.id ?? idx} className="space-y-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    {s.product_name && (
                      <p className="text-sm font-medium text-gray-900">{s.product_name}</p>
                    )}
                    {s.tracking_number && (
                      <div className="flex gap-3">
                        <Truck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">No. Resi</p>
                          <p className="text-sm font-medium text-gray-900 font-mono">{s.tracking_number}</p>
                        </div>
                      </div>
                    )}
                    {s.tracking_url && (
                      <div className="flex gap-3">
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Link Tracker</p>
                          <a
                            href={s.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-pink-600 hover:underline break-all"
                          >
                            {s.tracking_url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

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
