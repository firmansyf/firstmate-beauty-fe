'use client';

import { feedbackAPI } from '@/lib/api';
import { MessageSquare, Star, Trash2, CheckCheck, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Feedback {
  id: number;
  user_id: number | null;
  user_name: string | null;
  name: string;
  email: string | null;
  rating: number | null;
  category: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general:    { label: 'Umum',     color: 'bg-gray-100 text-gray-600' },
  praise:     { label: 'Pujian',   color: 'bg-green-100 text-green-700' },
  suggestion: { label: 'Saran',    color: 'bg-blue-100 text-blue-700' },
  bug:        { label: 'Bug',      color: 'bg-red-100 text-red-700' },
};

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-3.5 h-3.5"
          fill={s <= rating ? '#f59e0b' : 'none'}
          stroke={s <= rating ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  );
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({ rating: '', category: '', is_read: '' });

  useEffect(() => {
    fetchFeedbacks();
    fetchUnreadCount();
  }, [filters, pagination.currentPage]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await feedbackAPI.adminGetAll({
        ...filters,
        rating: filters.rating ? Number(filters.rating) : undefined,
        page: pagination.currentPage,
        limit: 20,
      });
      setFeedbacks(response.data.data);
      setPagination(response.data.pagination);
    } catch {
      toast.error('Gagal memuat feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await feedbackAPI.adminGetUnreadCount();
      setUnreadCount(res.data.count);
    } catch {}
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await feedbackAPI.adminMarkAsRead(id);
      setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, is_read: true } : f));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await feedbackAPI.adminMarkAllAsRead();
      setFeedbacks((prev) => prev.map((f) => ({ ...f, is_read: true })));
      setUnreadCount(0);
      toast.success('Semua feedback ditandai dibaca');
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus feedback ini?')) return;
    try {
      await feedbackAPI.adminDelete(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      setPagination((p) => ({ ...p, totalItems: p.totalItems - 1 }));
      toast.success('Feedback dihapus');
    } catch {
      toast.error('Gagal menghapus feedback');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Report
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-pink-600 text-white text-xs font-medium rounded-full">
                {unreadCount} baru
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.totalItems} total report</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 p-4 bg-white rounded-lg border border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500"
        >
          <option value="">Semua Kategori</option>
          <option value="general">Umum</option>
          <option value="praise">Pujian</option>
          <option value="suggestion">Saran</option>
          <option value="bug">Bug</option>
        </select>
        <select
          value={filters.rating}
          onChange={(e) => handleFilterChange('rating', e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500"
        >
          <option value="">Semua Rating</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Bintang</option>
          ))}
        </select>
        <select
          value={filters.is_read}
          onChange={(e) => handleFilterChange('is_read', e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500"
        >
          <option value="">Semua Status</option>
          <option value="false">Belum Dibaca</option>
          <option value="true">Sudah Dibaca</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada feedback</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`bg-white rounded-lg border p-5 transition-colors ${
                !fb.is_read ? 'border-pink-200 bg-pink-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-pink-700">
                    {fb.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{fb.name}</span>
                    {fb.email && (
                      <span className="text-xs text-gray-400">{fb.email}</span>
                    )}
                    {!fb.is_read && (
                      <span className="px-1.5 py-0.5 bg-pink-600 text-white text-xs rounded-full">Baru</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StarDisplay rating={fb.rating} />
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_LABELS[fb.category]?.color}`}>
                      {CATEGORY_LABELS[fb.category]?.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(fb.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">{fb.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!fb.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(fb.id)}
                      title="Tandai dibaca"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(fb.id)}
                    title="Hapus"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
