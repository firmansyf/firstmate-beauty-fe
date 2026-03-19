// src/components/common/Navbar.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Menu, ShoppingBag, X, LogIn, UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalQuantity, fetchCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/products', label: 'Produk' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-pink-600 capitalize">
              Alfath Skin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 group"
                >
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-pink-600'
                        : 'text-gray-600 group-hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </span>
                  {/* Underline indicator */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-pink-600 transition-all duration-300 ${
                      isActive ? 'w-6' : 'w-0 group-hover:w-4 group-hover:bg-gray-300'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                 <Link
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />

                  {totalQuantity > 0 && (
                    <span className="absolute top-0 -right-1 min-w-[18px] h-[18px] px-1
                      text-[10px] font-semibold text-white bg-red-500
                      rounded-full flex items-center justify-center">
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
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          Admin
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      >
                        Profil
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      >
                        Pesanan
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-x-5 justify-between">
                <Link
                  href="/login"
                  className="text-sm flex items-center leading-none gap-x-2 font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogIn size={17} />
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex gap-x-2 items-center leading-none text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <UserRoundPlus size={17} />
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg flex items-center transition-colors ${
                      isActive
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {/* Left border indicator for active */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-pink-600 rounded-r-full" />
                    )}
                    {link.label}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <Link
                    href="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${
                      pathname === '/cart'
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pathname === '/cart' && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-pink-600 rounded-r-full" />
                    )}
                    <span>Keranjang</span>
                    {totalQuantity > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {totalQuantity}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg flex items-center transition-colors ${
                      pathname.startsWith('/orders')
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pathname.startsWith('/orders') && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-pink-600 rounded-r-full" />
                    )}
                    Pesanan Saya
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg flex items-center transition-colors ${
                      pathname === '/profile'
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pathname === '/profile' && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-pink-600 rounded-r-full" />
                    )}
                    Profil
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  <div className="h-px bg-gray-100 my-2" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left transition-colors"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex flex-col gap-2 px-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LogIn size={16} />
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      <UserRoundPlus size={16} />
                      Daftar
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
