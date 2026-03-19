// src/components/customer/CartItem.tsx
'use client';

import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface CartItemProps {
  item: {
    id: number;
    product_id: number;
    name: string;
    price: number;
    discount_price?: number;
    quantity: number;
    image_url?: string;
    notes?: string;
    stock: number;
  };
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const finalPrice = item.discount_price || item.price;
  const subtotal = finalPrice * item.quantity;
  const isLocalImage = item.image_url?.includes('localhost');

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.stock) return;

    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100">
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.image_url && !imageError ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={isLocalImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">🧴</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {item.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm font-semibold text-pink-600">
            {formatCurrency(finalPrice)}
          </span>
          {item.discount_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
              className="p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-gray-500">Stok: {item.stock}</span>
        </div>
      </div>

      {/* Actions & Subtotal */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="text-right">
          <p className="text-xs text-gray-500">Subtotal</p>
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(subtotal)}</p>
        </div>
      </div>
    </div>
  );
}
