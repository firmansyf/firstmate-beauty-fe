// src/app/admin/payment/page.tsx
'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { uploadAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Upload, QrCode, Check, AlertCircle, Trash2, Download } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

export default function PaymentSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [qrisImageUrl, setQrisImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    // Check if QRIS image exists
    checkQrisImage();
  }, []);

  const checkQrisImage = async () => {
    try {
      const imageUrl = `${apiUrl}/uploads/qris-code.png`;
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        setQrisImageUrl(imageUrl + '?t=' + Date.now()); // Add timestamp to prevent cache
      }
    } catch (error) {
      console.log('QRIS image not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Store the file in state
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAPI.uploadQrisImage(selectedFile);
      toast.success('QRIS berhasil diupload');
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh the image
      setQrisImageUrl(`${apiUrl}/uploads/qris-code.png?t=${Date.now()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload QRIS');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus QRIS code?')) return;

    try {
      await uploadAPI.deleteQrisImage();
      toast.success('QRIS berhasil dihapus');
      setQrisImageUrl(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus QRIS');
    }
  };

  const handleDownload = async () => {
    if (!qrisImageUrl) return;

    try {
      const response = await fetch(qrisImageUrl);
      if (!response.ok) throw new Error('Failed to fetch');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS-AlfathSkin-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('QRIS berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh QRIS');
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Pengaturan Pembayaran</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola QRIS code untuk pembayaran</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current QRIS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-pink-600" />
            <h2 className="text-sm font-semibold text-gray-900">QRIS Aktif</h2>
          </div>

          {qrisImageUrl ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-square max-w-[300px] mx-auto bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
                <Image
                  src={qrisImageUrl}
                  alt="QRIS Code"
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-pink-600">
                <Check className="w-4 h-4" />
                <span>QRIS aktif dan siap digunakan</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 text-sm font-medium rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Unduh QRIS
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus QRIS
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Belum ada QRIS yang diupload</p>
              <p className="text-xs text-gray-400 mt-1">Upload QRIS untuk menerima pembayaran</p>
            </div>
          )}
        </Card>

        {/* Upload QRIS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-pink-600" />
            <h2 className="text-sm font-semibold text-gray-900">Upload QRIS Baru</h2>
          </div>

          <div className="space-y-4">
            {/* Preview or Upload Area */}
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative w-full aspect-square max-w-[300px] mx-auto bg-gray-50 rounded-lg border-2 border-pink-200 overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview QRIS"
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={cancelPreview}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader size="sm" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Simpan QRIS
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-pink-300 hover:bg-pink-50/50 transition-colors">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-pink-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Klik untuk upload gambar</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, atau WEBP (Maks. 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Gunakan gambar QRIS dengan kualitas tinggi</li>
                  <li>Pastikan kode QR terlihat jelas dan dapat di-scan</li>
                  <li>Disarankan menggunakan gambar dengan background putih</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Info */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Pembayaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-1">Metode Pembayaran</p>
            <p className="font-medium text-gray-900">QRIS</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-1">Batas Waktu Pembayaran</p>
            <p className="font-medium text-gray-900">24 Jam</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-1">Status</p>
            <p className={`font-medium ${qrisImageUrl ? 'text-pink-600' : 'text-yellow-600'}`}>
              {qrisImageUrl ? 'Aktif' : 'Belum Dikonfigurasi'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
