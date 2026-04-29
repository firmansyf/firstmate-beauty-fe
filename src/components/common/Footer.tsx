// src/components/common/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-pink-600">FirstMate Beauty</span>
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
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} Al-fath Skin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
