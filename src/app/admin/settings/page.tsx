'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { settingsAPI, uploadAPI } from '@/lib/api';
import { QrCode, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [qrisUrl, setQrisUrl] = useState('');

  useEffect(() => {
    settingsAPI
      .getPayment()
      .then((res) => setQrisUrl(res.data.data?.qris_image_url || ''))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
      setQrisUrl(response.data.data.url);
      toast.success('Gambar QRIS berhasil diupload');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleRemoveImage = () => {
    setQrisUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsAPI.updatePayment({ qris_image_url: qrisUrl });
      toast.success('Pengaturan pembayaran berhasil disimpan');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <QrCode className="w-5 h-5 text-pink-600" />
        <h1 className="text-xl font-semibold text-gray-900">Pengaturan Pembayaran</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Unggah gambar QRIS toko. Gambar ini ditampilkan ke customer saat melakukan pembayaran.
      </p>

      <div className="max-w-xl">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Gambar QRIS <span className="text-red-500">*</span>
          </h2>

          {qrisUrl ? (
            <div className="relative w-64 h-64 bg-white rounded-lg overflow-hidden border border-gray-200 mb-4">
              <Image src={qrisUrl} alt="QRIS" fill className="object-contain p-2" unoptimized />
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
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-64 h-64 rounded-lg border-2 border-dashed cursor-pointer transition-colors mb-4 ${
                isDragging
                  ? 'border-pink-500 bg-pink-50'
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
                    <span className="text-sm font-medium text-gray-600">Klik atau drag & drop</span>
                    <span className="text-xs text-gray-400 mt-1">Gambar QRIS toko</span>
                  </>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Atau masukkan URL gambar
            </label>
            <input
              type="url"
              value={qrisUrl}
              onChange={(e) => setQrisUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
              placeholder="https://example.com/qris.png"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="mt-4 w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader size="sm" />
                Menyimpan...
              </>
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
        </Card>
      </div>
    </div>
  );
}
