'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { bannersAPI, uploadAPI } from '@/lib/api';
import { ChevronLeft, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminCreateBannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    display_order: '0',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadProductImage(file);
      setFormData({ ...formData, image_url: response.data.data.url });
      toast.success('Gambar berhasil diupload');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Judul banner wajib diisi';
    if (!formData.image_url.trim()) newErrors.image_url = 'Gambar banner wajib diisi';

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'Tanggal selesai harus setelah tanggal mulai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        image_url: formData.image_url,
        link_url: formData.link_url || undefined,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order) || 0,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      };

      await bannersAPI.create(payload);
      toast.success('Banner berhasil ditambahkan');
      router.push('/admin/banners');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan banner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 cursor-pointer text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali
      </button>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">Tambah Banner Baru</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Banner</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Judul Banner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Contoh: Promo Akhir Tahun"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Deskripsi singkat banner (opsional)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="https://example.com/promo (opsional)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL tujuan ketika banner diklik
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Gambar Banner <span className="text-red-500">*</span>
              </h2>

              {/* Image Preview or Upload Area */}
              {formData.image_url ? (
                <div className="relative aspect-[3/1] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-[3/1] w-full rounded-lg border-2 border-dashed cursor-pointer transition-colors mb-4 ${
                    isDragging
                      ? 'border-pink-500 bg-pink-50'
                      : errors.image_url
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    {isUploading ? (
                      <>
                        <Loader size="md" />
                        <span className="text-sm mt-2">Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-2" />
                        <span className="text-sm font-medium text-gray-600">
                          Klik atau drag & drop gambar
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Rekomendasi: 1200x400 px (3:1)
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
              {errors.image_url && <p className="text-sm text-red-600 mb-4">{errors.image_url}</p>}

              {/* URL Input as alternative */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Atau masukkan URL gambar
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Status & Urutan</h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Banner Aktif</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Banner aktif akan ditampilkan di homepage
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="0"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Angka lebih kecil ditampilkan lebih dulu
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Jadwal Tayang</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Kosongkan jika langsung tayang
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                      errors.end_date ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Kosongkan jika tayang tanpa batas waktu
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-pink-50 border-pink-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>Gunakan gambar dengan rasio 3:1</li>
                <li>Judul yang menarik meningkatkan klik</li>
                <li>Atur jadwal untuk promo terbatas</li>
                <li>Urutan kecil tampil lebih dulu</li>
              </ul>
            </Card>

            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size="sm" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Banner'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
