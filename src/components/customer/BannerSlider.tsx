'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Banner {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  display_order: number;
}

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length, nextSlide]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const BannerContent = () => (
    <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] lg:aspect-[4/1] bg-gray-100 rounded-xl overflow-hidden">
      <Image
        src={currentBanner.image_url}
        alt={currentBanner.title}
        fill
        className="object-cover"
        priority
        unoptimized
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-banner.png';
        }}
      />

      {/* Gradient overlay for text readability */}
      {currentBanner.description && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      )}

      {/* Text content */}
      {(currentBanner.title || currentBanner.description) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-xl">
            {currentBanner.title && (
              <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold drop-shadow-lg">
                {currentBanner.title}
              </h2>
            )}
            {currentBanner.description && (
              <p className="text-white/90 text-sm sm:text-base mt-1 line-clamp-2 drop-shadow">
                {currentBanner.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation arrows - only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots indicator - only show if multiple banners */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Wrap in link if has link_url
  if (currentBanner.link_url) {
    return (
      <Link href={currentBanner.link_url} className="block">
        <BannerContent />
      </Link>
    );
  }

  return <BannerContent />;
}
