// src/components/common/Footer.tsx
'use client';

import FeedbackModal from '@/components/customer/FeedbackModal';
import Link from 'next/link';
import { useState } from 'react';
import NextImage from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <NextImage src="/logo.png" alt="FirstMate Beauty" width={200} height={50} className='object-contain' />
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/products"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Produk
            </Link>
            <Link
              href="/orders"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pesanan
            </Link>
            
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-pink-600 transition-colors cursor-pointer"
              >
                Report
              </button>
            
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} FirstMate Beauty. All rights reserved.
          </p>
        </div>
      </div>

      
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      
    </footer>
  );
}
