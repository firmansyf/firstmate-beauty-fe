'use client';

import Modal from '@/components/common/Modal';
import PaymentInstructions from '@/components/customer/PaymentInstructions';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface PaymentInfo {
  method: string;
  merchant_name: string;
  qris_image_url: string;
  instructions: string[];
  total_amount: number;
  order_number: string;
  deadline: string;
  expiration_hours: number;
}

interface OrderData {
  id: number;
  order_number: string;
  total: number;
  created_at: string;
  payment_info?: PaymentInfo;
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
          Silakan selesaikan pembayaran Anda
        </motion.p>
      </div>

      {/* Payment Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PaymentInstructions
          total={orderData.payment_info?.total_amount || orderData.total}
          orderNumber={orderData.payment_info?.order_number || orderData.order_number}
          createdAt={orderData.created_at}
          qrisImageUrl={orderData.payment_info?.qris_image_url}
          instructions={orderData.payment_info?.instructions}
          expirationHours={orderData.payment_info?.expiration_hours || 24}
        />
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
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
