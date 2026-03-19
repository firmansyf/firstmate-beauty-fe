'use client';

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!formData.phone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Nomor telepon minimal 10 digit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      // Store password temporarily for auto-login after OTP verification
      sessionStorage.setItem('pendingPassword', formData.password);
      sessionStorage.setItem('pendingEmail', formData.email);
      toast.success('Kode OTP telah dikirim ke email Anda');
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast.error(error.message || 'Registrasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Daftar</h1>
        <p className="text-sm text-gray-500 mt-1">Buat akun baru</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Nama lengkap"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="nama@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            No. Telepon (E-Wallet) <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="08123456789"
          />
          {errors.phone ? (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">Nomor terhubung ke e-wallet untuk refund</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="••••••••"
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">Minimal 6 karakter</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Konfirmasi Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </>
          ) : (
            'Daftar'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-pink-600 font-medium hover:text-pink-700">
          Masuk
        </Link>
      </p>
    </div>
  );
}
