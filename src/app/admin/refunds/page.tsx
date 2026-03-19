'use client';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { refundsAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  getRefundStatusColor,
  getRefundStatusText,
} from '@/lib/utils';
import { ChevronRight, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Refund {
  id: number;
  refund_number: string;
  order_number: string;
  refund_amount: number;
  ewallet_phone: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRefunds();
  }, [page, filterStatus]);

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const response = await refundsAPI.adminGetAll({
        page,
        limit: 20,
        status: filterStatus || undefined,
        search: searchQuery || undefined,
      });
      setRefunds(response.data.data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRefunds();
  };

  const statusTabs = [
    { value: '', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'completed', label: 'Selesai' },
  ];

  if (isLoading && refunds.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Kelola Refund</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola permintaan refund dari customer</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilterStatus(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === tab.value
                ? 'bg-pink-100 text-pink-700 border border-pink-300'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="p-4 mb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari refund ID, order ID, atau nama customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>
        </form>
      </Card>

      {/* Refunds Table */}
      {refunds.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Refund ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    E-Wallet
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        #{refund.refund_number}
                      </span>
                      <p className="text-xs text-gray-500">{formatDate(refund.created_at)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{refund.customer_name}</p>
                      <p className="text-xs text-gray-500">{refund.customer_phone}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      #{refund.order_number}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {formatCurrency(refund.refund_amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {refund.ewallet_phone}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRefundStatusColor(refund.status)}`}>
                        {getRefundStatusText(refund.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/refunds/${refund.id}`}
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
        </Card>
      ) : (
        <EmptyState
          icon={RotateCcw}
          title="Tidak ada refund"
          description={
            searchQuery
              ? 'Tidak ada refund yang cocok dengan pencarian'
              : filterStatus
              ? `Tidak ada refund dengan status ${getRefundStatusText(filterStatus)}`
              : 'Belum ada permintaan refund'
          }
        />
      )}
    </div>
  );
}
