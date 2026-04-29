// src/app/(auth)/layout.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <NextImage src="/logo.png" alt="FirstMate Beauty" width={90} height={90} className="object-contain" />
        </Link>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} FirstMate Beauty
        </p>
      </div>
    </div>
  );
}
