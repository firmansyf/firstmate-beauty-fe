// src/components/common/Navbar.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  ShoppingBag,
  User,
  UserRoundPlus,
  X,
  ClipboardList,
  Menu,
} from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalQuantity, fetchCart } = useCartStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDrawerOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/products', label: 'Produk', icon: Package },
  ];

  const isActiveLink = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/">
              <NextImage src="/logo.png" alt="Alfath Skin" width={150} height={30} className="object-contain" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href);
                return (
                  <Link key={link.href} href={link.href} className="relative px-4 py-2 group">
                    <span className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-pink-600' : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                      {link.label}
                    </span>
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-pink-600 transition-all duration-300 ${
                      isActive ? 'w-6' : 'w-0 group-hover:w-4 group-hover:bg-gray-300'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                    {totalQuantity > 0 && (
                      <span className="absolute top-0 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full flex items-center justify-center">
                        {totalQuantity}
                      </span>
                    )}
                  </Link>
                  <div className="relative group">
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      {user?.name}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="py-2">
                        {user?.role === 'admin' && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                            Admin
                          </Link>
                        )}
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                          Profil
                        </Link>
                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                          Pesanan
                        </Link>
                        <button onClick={handleLogout} className="w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Keluar
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-x-5">
                  <Link href="/login" className="text-sm flex items-center gap-x-2 font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <LogIn size={17} /> Masuk
                  </Link>
                  <Link href="/register" className="flex gap-x-2 items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <UserRoundPlus size={17} /> Daftar
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex md:hidden items-center gap-1">
              {isAuthenticated && (
                <Link href="/cart" className="relative p-2 text-gray-600">
                  <ShoppingBag className="w-5 h-5" />
                  {totalQuantity > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Buka menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
          <NextImage src="/logo.png" alt="Alfath Skin" width={120} height={40} className="object-contain" />
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        {isAuthenticated ? (
          <div className="px-5 py-4 bg-pink-50 border-b border-pink-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0 space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-pink-600 rounded-xl hover:bg-pink-700 transition-colors"
            >
              <UserRoundPlus className="w-4 h-4" />
              Daftar Sekarang
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {/* Main links */}
          <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-pink-50 text-pink-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-pink-600' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}

          {/* Authenticated links */}
          {isAuthenticated && (
            <>
              <div className="pt-3 pb-2">
                <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Akun
                </p>
                <Link
                  href="/cart"
                  className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/cart' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className={`w-5 h-5 flex-shrink-0 ${pathname === '/cart' ? 'text-pink-600' : 'text-gray-400'}`} />
                    Keranjang
                  </div>
                  {totalQuantity > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {totalQuantity}
                    </span>
                  )}
                </Link>

                <Link
                  href="/orders"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname.startsWith('/orders') ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/orders') ? 'text-pink-600' : 'text-gray-400'}`} />
                  Pesanan Saya
                </Link>

                <Link
                  href="/profile"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/profile' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User className={`w-5 h-5 flex-shrink-0 ${pathname === '/profile' ? 'text-pink-600' : 'text-gray-400'}`} />
                  Profil Saya
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0 text-gray-400" />
                    Dashboard Admin
                  </Link>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Logout Footer */}
        {isAuthenticated && (
          <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              Keluar
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
