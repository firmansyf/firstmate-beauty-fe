'use client';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { bannersAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Edit, Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Banner {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('');

  useEffect(() => {
    fetchBanners();
  }, [filterActive]);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await bannersAPI.adminGetAll({
        is_active: filterActive || undefined,
        search: searchQuery || undefined,
        limit: 50,
      });
      setBanners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Gagal memuat data banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBanners();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await bannersAPI.toggleStatus(id);
      toast.success('Status banner berhasil diubah');
      fetchBanners();
    } catch (error) {
      toast.error('Gagal mengubah status banner');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus banner ini?')) return;

    try {
      await bannersAPI.delete(id);
      toast.success('Banner berhasil dihapus');
      fetchBanners();
    } catch (error) {
      toast.error('Gagal menghapus banner');
    }
  };

  const getBannerStatus = (banner: Banner) => {
    if (!banner.is_active) {
      return { label: 'Nonaktif', color: 'bg-gray-100 text-gray-800' };
    }

    const now = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;

    if (startDate && startDate > now) {
      return { label: 'Terjadwal', color: 'bg-blue-100 text-blue-800' };
    }

    if (endDate && endDate < now) {
      return { label: 'Kadaluarsa', color: 'bg-red-100 text-red-800' };
    }

    return { label: 'Aktif', color: 'bg-pink-100 text-pink-800' };
  };

  const statusTabs = [
    { value: '', label: 'Semua' },
    { value: 'true', label: 'Aktif' },
    { value: 'false', label: 'Nonaktif' },
  ];

  if (isLoading && banners.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kelola Banner</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola banner promosi untuk homepage</p>
        </div>
        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Banner
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterActive(tab.value)}
            className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium whitespace-nowrap transition-colors ${
              filterActive === tab.value
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
              placeholder="Cari banner berdasarkan judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>
        </form>
      </Card>

      {/* Banners Table */}
      {banners.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Banner
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Jadwal
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Urutan
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => {
                  const status = getBannerStatus(banner);
                  return (
                    <tr key={banner.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-24 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {banner.image_url ? (
                              <Image
                                src={banner.image_url}
                                alt={banner.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{banner.title}</p>
                            {banner.link_url && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {banner.link_url}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(banner.id)}
                          className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${status.color}`}
                        >
                          {status.label}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {banner.start_date || banner.end_date ? (
                          <div className="text-xs text-gray-600">
                            {banner.start_date && (
                              <p>Mulai: {formatDate(banner.start_date)}</p>
                            )}
                            {banner.end_date && (
                              <p>Sampai: {formatDate(banner.end_date)}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Tidak ada jadwal</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {banner.display_order}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/banners/${banner.id}/edit`}
                            className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="Belum ada banner"
          description={
            searchQuery
              ? 'Tidak ada banner yang cocok dengan pencarian'
              : 'Mulai tambahkan banner promosi untuk homepage'
          }
        />
      )}
    </div>
  );
}
