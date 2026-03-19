'use client';

import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode, Clock, AlertCircle, Download } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PaymentInstructionsProps {
  total: number;
  orderNumber: string;
  createdAt: string;
  qrisImageUrl?: string;
  instructions?: string[];
  expirationHours?: number;
  compact?: boolean;
}

const defaultInstructions = [
  'Buka aplikasi e-wallet atau mobile banking Anda',
  'Pilih menu Scan QR atau QRIS',
  'Scan kode QR di bawah ini',
  'Pastikan nominal sesuai total pesanan',
  'Konfirmasi dan selesaikan pembayaran'
];

export default function PaymentInstructions({
  total,
  orderNumber,
  createdAt,
  qrisImageUrl = '/uploads/qris-code.png',
  instructions = defaultInstructions,
  expirationHours = 24,
  compact = false
}: PaymentInstructionsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const deadline = new Date(new Date(createdAt).getTime() + expirationHours * 60 * 60 * 1000);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Waktu habis');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours} jam ${minutes} menit`);
      } else {
        setTimeLeft(`${minutes} menit`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success('Berhasil disalin');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Gagal menyalin');
    }
  };

  const handleDownloadQR = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(fullQrisUrl);
      if (!response.ok) throw new Error('Failed to fetch QR code');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS-${orderNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('QR Code berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh QR Code');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDeadline = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fullQrisUrl = qrisImageUrl.startsWith('http') ? qrisImageUrl : `${apiUrl}${qrisImageUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-pink-100 ${compact ? 'p-4' : 'p-5'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
          <QrCode className="w-4 h-4 text-pink-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Pembayaran QRIS</h3>
          <p className="text-xs text-gray-500">Scan untuk membayar</p>
        </div>
      </div>

      {/* QRIS Image */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-48 h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
          <Image
            src={fullQrisUrl}
            alt="QRIS Code"
            fill
            className="object-contain p-2"
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-gray-400"><svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg><span class="text-xs">QRIS Code</span></div>';
              }
            }}
          />
        </div>
        {/* Download QR Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadQR}
          disabled={isDownloading}
          className="mt-3 cursor-pointer flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 text-sm font-medium rounded-lg hover:bg-pink-100 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Mengunduh...' : 'Unduh QR Code'}
        </motion.button>
      </div>

      {/* Payment Details */}
      <div className="space-y-3 mb-4">
        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Total Pembayaran</p>
            <p className="text-lg font-bold text-pink-600">{formatCurrency(total)}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopy(total.toString(), 'total')}
            className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
            title="Salin nominal"
          >
            {copied === 'total' ? (
              <Check className="w-4 h-4 text-pink-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        </div>

        {/* Order Number */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Nomor Pesanan</p>
            <p className="text-sm font-medium text-gray-900">{orderNumber}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopy(orderNumber, 'order')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Salin nomor pesanan"
          >
            {copied === 'order' ? (
              <Check className="w-4 h-4 text-pink-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-amber-700">Bayar sebelum</p>
            <p className="text-sm font-medium text-amber-800">{formatDeadline(deadline)}</p>
            <p className="text-xs text-amber-600">Sisa waktu: {timeLeft}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!compact && (
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Cara Pembayaran:</h4>
          <ol className="space-y-2">
            {instructions.map((instruction, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 text-sm text-gray-600"
              >
                <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {/* Note */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Pembayaran akan diverifikasi otomatis dalam 1-5 menit setelah transaksi berhasil.
        </p>
      </div>
    </motion.div>
  );
}
