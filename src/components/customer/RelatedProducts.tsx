'use client';

import { productsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  category_name: string | null;
  is_available: boolean;
  stock: number;
  rating: number;
}

export default function RelatedProducts({ currentSlug }: { currentSlug: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    productsAPI.getRelated(currentSlug)
      .then((res) => setProducts(res.data.data))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [currentSlug]);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [products]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('a')?.offsetWidth ?? 200;
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + 16) * 2 : (cardWidth + 16) * 2, behavior: 'smooth' });
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Produk yang mungkin Anda suka</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-pink-400 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-pink-400 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-none w-44 sm:w-52 rounded-xl bg-gray-100 animate-pulse"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="aspect-square rounded-t-xl bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          : products.map((product) => {
              const hasDiscount = product.discount_price && product.discount_price < product.price;
              const finalPrice = hasDiscount ? product.discount_price! : product.price;
              const discountPct = hasDiscount
                ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
                : 0;
              const outOfStock = !product.is_available || product.stock === 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex-none w-44 sm:w-52 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:border-pink-100 transition-all group"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative aspect-square rounded-t-xl overflow-hidden bg-gray-50">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 176px, 208px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">✨</div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                        -{discountPct}%
                      </span>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">Stok Habis</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    {product.category_name && (
                      <p className="text-xs text-gray-400 mb-0.5 truncate">{product.category_name}</p>
                    )}
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1.5">
                      {product.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
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
                </Link>
              );
            })}
      </div>
    </section>
  );
}
