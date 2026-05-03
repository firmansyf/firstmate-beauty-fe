// src/components/customer/ProductCard.tsx
'use client';

import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useState } from 'react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price?: number;
    image_url?: string;
    category_name?: string;
    stock: number;
    is_available: boolean;
  };
  index?: number;
}

function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const price = Number(product.price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;

  const hasDiscount = discountPrice !== null && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const isOutOfStock = !product.is_available || product.stock === 0;
  const isLocalImage = product.image_url?.includes('localhost');

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.image_url && !imageError ? (
            <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized={isLocalImage}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <span className="text-3xl">✨</span>
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-medium rounded">
              Promo
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">Habis</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-3">
          {product.category_name && (
            <span className="block text-[11px] sm:text-xs text-gray-500 truncate">
              {product.category_name}
            </span>
          )}

          <h3 className="text-[13px] sm:text-sm font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[13px] sm:text-sm font-semibold text-pink-600">
              {formatCurrency(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
