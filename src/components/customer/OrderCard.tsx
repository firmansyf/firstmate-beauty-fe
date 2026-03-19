// src/components/customer/OrderCard.tsx
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusText } from '@/lib/utils';
import { ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';

interface OrderCardProps {
  order: {
    id: number;
    order_number: string;
    created_at: string;
    status: string;
    payment_status: string;
    total: number;
    total_items: number;
  };
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900">{order.order_number}</span>
            </div>
            <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusText(order.status)}
          </span>
        </div>

        {/* Items Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            {order.total_items} item
          </span>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Total Belanja</div>
            <div className="text-lg font-bold text-primary-600">
              {formatCurrency(order.total)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}