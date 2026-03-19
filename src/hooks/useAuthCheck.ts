// src/hooks/useAuthCheck.ts
'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Check interval in milliseconds (every 1 minute)
const CHECK_INTERVAL_MS = 60 * 1000;

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/', '/products', '/categories'];

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isTokenExpired, logout, checkAuth } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Start periodic check only if authenticated
    if (isAuthenticated) {
      intervalRef.current = setInterval(() => {
        if (isTokenExpired()) {
          logout('expired');

          // Only redirect if on a protected route
          const isPublicRoute = PUBLIC_ROUTES.some(
            (route) => pathname === route || pathname.startsWith('/products/')
          );

          if (!isPublicRoute) {
            router.push('/login');
          }
        }
      }, CHECK_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, isTokenExpired, logout, checkAuth, router, pathname]);

  return { isAuthenticated };
}
