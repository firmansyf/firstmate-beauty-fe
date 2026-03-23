'use client';

import Modal from '@/components/common/Modal';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface OrderData {
  id: number;
  order_number: string;
  total: number;
  created_at: string;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderData | null;
  onViewOrder: () => void;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderData,
  onViewOrder
}: OrderSuccessModalProps) {
  if (!orderData) return null;

  const handleViewOrder = () => {
    onClose();
    onViewOrder();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="text-center mb-6">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CheckCircle className="w-8 h-8 text-pink-600" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-gray-900"
        >
          Pesanan Berhasil Dibuat!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 mt-1"
        >
          Nomor pesanan: <span className="font-medium text-gray-900">#{orderData.order_number}</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 mt-2"
        >
          Silakan selesaikan pembayaran melalui halaman detail pesanan.
        </motion.p>
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <button
          onClick={handleViewOrder}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
        >
          Lihat Detail Pesanan
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </Modal>
  );
}
