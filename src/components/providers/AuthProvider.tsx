// src/components/providers/AuthProvider.tsx
'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // This hook handles periodic auth check and auto-logout on expiration
  useAuthCheck();

  return <>{children}</>;
}
