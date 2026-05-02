// src/components/admin/Sidebar.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import {
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  RotateCcw,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const links = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/products',
      label: 'Produk',
      icon: Package,
    },
    {
      href: '/admin/categories',
      label: 'Kategori',
      icon: FolderOpen,
    },
    {
      href: '/admin/orders',
      label: 'Pesanan',
      icon: ShoppingBag,
    },
    {
      href: '/admin/refunds',
      label: 'Refund',
      icon: RotateCcw,
    },
    {
      href: '/admin/banners',
      label: 'Banner',
      icon: ImageIcon,
    },
    {
      href: '/admin/users',
      label: 'Pengguna',
      icon: Users,
    },
    {
      href: '/admin/feedbacks',
      label: 'Report',
      icon: MessageSquare,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <NextImage src="/logo.png" alt="FirstMate Beauty" width={100} height={34} className="object-contain" />
            </Link>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* User Info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-pink-600 rounded-full flex border items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-gray-900">FirstMate Beauty Admin</span>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-gray-50 rounded-lg"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-40 mt-14"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-gray-100 flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
