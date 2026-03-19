// src/components/customer/ProductCard.tsx
'use client';

import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

   // Convert to numbers for proper comparison
   const price = Number(product.price);
   const discountPrice = product.discount_price ? Number(product.discount_price) : null;
   
   const hasDiscount = discountPrice !== null && discountPrice < price;
   const finalPrice = hasDiscount ? discountPrice : price;
   const isOutOfStock = !product.is_available || product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <motion.div
          whileHover={{ y: -6, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg border border-gray-100 overflow-hidden"
        >
          {/* Image */}
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {product.image_url && !imageError ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <motion.span
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-3xl"
                >
                  ✨
                </motion.span>
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded"
              >
                Promo
              </motion.span>
            )}

            {/* Out of Stock */}
            {isOutOfStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/80 flex items-center justify-center"
              >
                <span className="text-sm font-medium text-gray-500">Habis</span>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Category */}
            {product.category_name && (
              <span className="text-xs text-gray-500">
                {product.category_name}
              </span>
            )}

            {/* Name */}
            <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-pink-600">
                {formatCurrency(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
