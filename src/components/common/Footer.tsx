'use client';

import FeedbackModal from '@/components/customer/FeedbackModal';
import Link from 'next/link';
import { useState } from 'react';
import NextImage from 'next/image';
import { Instagram, MessageCircle, Mail, Heart } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/products', label: 'Produk' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
];

// const socialLinks = [
//   {
//     href: 'mailto:hello@firstmatebeauty.com',
//     label: 'Email',
//     icon: Mail,
//   },
// ];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="flex flex-col gap-4 sm:col-span-1">
            <NextImage
              src="/logo.png"
              alt="FirstMate Beauty"
              width={160}
              height={40}
              className="object-contain"
            />
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Teman setia perjalanan kecantikan Anda. Produk skincare original,
              berkualitas, dan terpercaya.
            </p>
            {/* Social icons
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center text-gray-500 transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div> */}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Navigasi
            </h3>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-600 hover:text-pink-600 transition-colors duration-200 w-fit"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Bantuan
            </h3>
            <Link
              href="/tentang-kami#faq"
              className="text-sm text-gray-600 hover:text-pink-600 transition-colors duration-200 w-fit"
            >
              FAQ
            </Link>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-sm text-gray-600 hover:text-pink-600 transition-colors duration-200 text-left w-fit cursor-pointer"
            >
              Kirim Report
            </button>
           
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} FirstMate Beauty. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-pink-400 fill-pink-400" /> for your skin
          </p>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </footer>
  );
}
