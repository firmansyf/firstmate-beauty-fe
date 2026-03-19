'use client';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { refundsAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDateTime,
  getRefundStatusColor,
  getRefundStatusText,
} from '@/lib/utils';
import { ChevronRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Refund {
  id: number;
  refund_number: string;
  order_number: string;
  refund_amount: number;
  ewallet_phone: string;
  reason: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  completed_at?: string;
}

export default function CustomerRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await refundsAPI.getUserRefunds();
      setRefunds(response.data.data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader size="lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Riwayat Refund</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar pengajuan refund Anda</p>
        </div>

        {refunds.length > 0 ? (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <Card key={refund.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        #{refund.refund_number}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRefundStatusColor(refund.status)}`}>
                        {getRefundStatusText(refund.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Order: #{refund.order_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {refund.reason}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Jumlah Refund</p>
                        <p className="text-sm font-semibold text-pink-600">
                          {formatCurrency(refund.refund_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">E-Wallet</p>
                        <p className="text-sm text-gray-900">{refund.ewallet_phone}</p>
                      </div>
                    </div>
                    {refund.admin_notes && refund.status !== 'pending' && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Catatan Admin:</p>
                        <p className="text-sm text-gray-700">{refund.admin_notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {formatDateTime(refund.created_at)}
                    </p>
                    {refund.completed_at && (
                      <p className="text-xs text-pink-600 mt-1">
                        Selesai: {formatDateTime(refund.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={RotateCcw}
            title="Belum ada refund"
            description="Anda belum pernah mengajukan refund"
          />
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Lihat Daftar Pesanan
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
