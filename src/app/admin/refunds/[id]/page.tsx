'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { refundsAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDateTime,
  getRefundStatusColor,
  getRefundStatusText,
} from '@/lib/utils';
import { ChevronLeft, Mail, MapPin, Phone, User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Refund {
  id: number;
  refund_number: string;
  order_id: number;
  order_number: string;
  order_total: number;
  refund_amount: number;
  ewallet_phone: string;
  reason: string;
  status: string;
  admin_notes?: string;
  approved_by_name?: string;
  transfer_proof_url?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  recipient_name: string;
  order_phone: string;
  shipping_address: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  completed_at?: string;
}

export default function AdminRefundDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [refund, setRefund] = useState<Refund | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [transferProof, setTransferProof] = useState('');

  useEffect(() => {
    fetchRefund();
  }, [params.id]);

  const fetchRefund = async () => {
    try {
      const response = await refundsAPI.adminGetDetail(parseInt(params.id));
      setRefund(response.data.data);
      setAdminNotes(response.data.data.admin_notes || '');
    } catch {
      toast.error('Refund tidak ditemukan');
      router.push('/admin/refunds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Yakin ingin menyetujui refund ini?')) return;

    setIsProcessing(true);
    try {
      await refundsAPI.adminApprove(parseInt(params.id), { admin_notes: adminNotes });
      toast.success('Refund berhasil disetujui');
      fetchRefund();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyetujui refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    if (!confirm('Yakin ingin menolak refund ini?')) return;

    setIsProcessing(true);
    try {
      await refundsAPI.adminReject(parseInt(params.id), { admin_notes: adminNotes });
      toast.success('Refund berhasil ditolak');
      fetchRefund();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menolak refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Yakin sudah melakukan transfer ke e-wallet customer?')) return;

    setIsProcessing(true);
    try {
      await refundsAPI.adminComplete(parseInt(params.id), { transfer_proof_url: transferProof });
      toast.success('Refund berhasil diselesaikan');
      fetchRefund();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyelesaikan refund');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!refund) return null;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center cursor-pointer gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Detail Refund</h1>
          <p className="text-sm text-gray-500 mt-1">#{refund.refund_number}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRefundStatusColor(refund.status)}`}>
          {getRefundStatusText(refund.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Refund Info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Refund</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order</span>
                <span className="text-sm font-medium text-gray-900">#{refund.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Jumlah Refund</span>
                <span className="text-sm font-semibold text-pink-600">{formatCurrency(refund.refund_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tanggal Pengajuan</span>
                <span className="text-sm text-gray-900">{formatDateTime(refund.created_at)}</span>
              </div>
            </div>
          </Card>

          {/* Reason */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Alasan Refund</h2>
            <p className="text-sm text-gray-600">{refund.reason}</p>
          </Card>

          {/* E-Wallet Info */}
          <Card className="p-5 bg-orange-50 border-orange-100">
            <div className="flex gap-3">
              <Wallet className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Nomor E-Wallet untuk Transfer</h3>
                <p className="text-lg font-bold text-orange-600">{refund.ewallet_phone}</p>
                <p className="text-xs text-gray-500 mt-1">Transfer refund ke nomor ini (GoPay/OVO/Dana/dll)</p>
              </div>
            </div>
          </Card>

          {/* Admin Actions - Pending */}
          {refund.status === 'pending' && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Tindakan Admin</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Catatan Admin
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan (wajib untuk penolakan)..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? 'Memproses...' : 'Setujui'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Complete Transfer - Approved */}
          {refund.status === 'approved' && (
            <Card className="p-5 bg-blue-50 border-blue-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Selesaikan Transfer</h2>
              <p className="text-sm text-gray-600 mb-4">
                Silakan transfer sebesar <strong>{formatCurrency(refund.refund_amount)}</strong> ke nomor e-wallet <strong>{refund.ewallet_phone}</strong>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL Bukti Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    value={transferProof}
                    onChange={(e) => setTransferProof(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button
                  onClick={handleComplete}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? 'Memproses...' : 'Tandai Sudah Transfer'}
                </button>
              </div>
            </Card>
          )}

          {/* Admin Notes (for approved/rejected/completed) */}
          {refund.admin_notes && refund.status !== 'pending' && (
            <Card className="p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Catatan Admin</h3>
              <p className="text-sm text-gray-600">{refund.admin_notes}</p>
              {refund.approved_by_name && (
                <p className="text-xs text-gray-400 mt-2">Oleh: {refund.approved_by_name}</p>
              )}
            </Card>
          )}

          {/* Transfer Proof */}
          {refund.transfer_proof_url && (
            <Card className="p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Bukti Transfer</h3>
              <a
                href={refund.transfer_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pink-600 hover:text-pink-700 underline"
              >
                Lihat Bukti Transfer
              </a>
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
                  <p className="text-sm font-medium text-gray-900">{refund.customer_name}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Telepon</p>
                  <p className="text-sm font-medium text-gray-900">{refund.customer_phone}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{refund.customer_email}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Alamat Pengiriman</h2>
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">{refund.recipient_name}</p>
                <p className="text-sm text-gray-600">{refund.shipping_address}</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full mt-2 bg-pink-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Diajukan</p>
                  <p className="text-xs text-gray-500">{formatDateTime(refund.created_at)}</p>
                </div>
              </div>
              {refund.approved_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-pink-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Disetujui</p>
                    <p className="text-xs text-gray-500">{formatDateTime(refund.approved_at)}</p>
                  </div>
                </div>
              )}
              {refund.rejected_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ditolak</p>
                    <p className="text-xs text-gray-500">{formatDateTime(refund.rejected_at)}</p>
                  </div>
                </div>
              )}
              {refund.completed_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Selesai</p>
                    <p className="text-xs text-gray-500">{formatDateTime(refund.completed_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
