import { create } from 'zustand';
import { authAPI } from '@/lib/api';

// Token expiration time in milliseconds (1 day = 24 hours)
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loginAt: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: (reason?: 'manual' | 'expired') => void;
  checkAuth: () => boolean;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loginAt: null,
  isLoading: false,
  isAuthenticated: false,

  loginWithGoogle: async (accessToken: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.googleLogin({ access_token: accessToken });
      const { user, token } = response.data.data;
      const loginAt = Date.now();

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginAt', loginAt.toString());

      set({ user, token, loginAt, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Login dengan Google gagal');
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;
      const loginAt = Date.now();

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginAt', loginAt.toString());

      set({
        user,
        token,
        loginAt,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await authAPI.register(data);
      set({ isLoading: false });
      // Registration now requires OTP verification before login
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Registrasi gagal');
    }
  },

  logout: (reason?: 'manual' | 'expired') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginAt');
    set({
      user: null,
      token: null,
      loginAt: null,
      isAuthenticated: false
    });

    // Store logout reason for displaying message after redirect
    if (reason === 'expired') {
      sessionStorage.setItem('logoutReason', 'expired');
    }
  },

  isTokenExpired: () => {
    const loginAt = get().loginAt || parseInt(localStorage.getItem('loginAt') || '0');
    if (!loginAt) return true;

    const now = Date.now();
    return now - loginAt >= TOKEN_EXPIRATION_MS;
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const loginAtStr = localStorage.getItem('loginAt');

    if (token && userStr && loginAtStr) {
      const loginAt = parseInt(loginAtStr);
      const now = Date.now();

      // Check if token has expired
      if (now - loginAt >= TOKEN_EXPIRATION_MS) {
        // Token expired, logout automatically
        get().logout('expired');
        return false;
      }

      const user = JSON.parse(userStr);
      set({
        user,
        token,
        loginAt,
        isAuthenticated: true
      });
      return true;
    }
    return false;
  },
}));