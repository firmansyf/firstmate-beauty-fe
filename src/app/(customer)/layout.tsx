// src/app/(customer)/layout.tsx
'use client';

import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import '../globals.css';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
