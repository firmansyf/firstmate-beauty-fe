'use client';

import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const login = useAuthStore((state) => state.login);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email param
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace: clear current and focus previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Masukkan 6 digit kode OTP');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.verifyOTP({ email: email!, otp: otpCode });
      toast.success('Email berhasil diverifikasi!');

      // Auto login with stored credentials
      const storedPassword = sessionStorage.getItem('pendingPassword');
      if (storedPassword) {
        try {
          await login(email!, storedPassword);
          sessionStorage.removeItem('pendingPassword');
          sessionStorage.removeItem('pendingEmail');
          router.push('/');
          return;
        } catch {
          // If auto-login fails, redirect to login page
        }
      }

      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kode OTP tidak valid');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;

    setIsResending(true);
    try {
      await authAPI.sendOTP({ email });
      toast.success('Kode OTP baru telah dikirim');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Verifikasi Email</h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan kode OTP yang dikirim ke
        </p>
        <p className="text-sm font-medium text-pink-600 mt-0.5">{email}</p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memverifikasi...
            </>
          ) : (
            'Verifikasi'
          )}
        </button>
      </form>

      {/* Resend */}
      <div className="text-center mt-4">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-pink-600 font-medium hover:text-pink-700 cursor-pointer disabled:opacity-50"
          >
            {isResending ? 'Mengirim...' : 'Kirim ulang kode OTP'}
          </button>
        ) : (
          <p className="text-sm text-gray-400">
            Kirim ulang dalam <span className="font-medium text-gray-600">{countdown}s</span>
          </p>
        )}
      </div>
    </div>
  );
}
