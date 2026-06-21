'use client';

import { authAPI } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: email
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Step 2: OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: new password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isResetting, setIsResetting] = useState(false);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email) { setEmailError('Email wajib diisi'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Email tidak valid'); return; }

    setIsCheckingEmail(true);
    try {
      await authAPI.forgotPassword({ email });
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 404) {
        setEmailError('Email tidak terdaftar');
      } else {
        setEmailError(msg || 'Terjadi kesalahan, coba lagi');
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { setOtpError('Masukkan 6 digit kode OTP'); return; }

    setIsVerifyingOtp(true);
    try {
      // Validate OTP exists before proceeding (lightweight: just store it, backend verifies on reset)
      setVerifiedOtp(otpCode);
      setStep(3);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Kode OTP tidak valid');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newPassword) errors.newPassword = 'Password baru wajib diisi';
    else if (newPassword.length < 8) errors.newPassword = 'Password minimal 8 karakter';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Password tidak cocok';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsResetting(true);
    try {
      await authAPI.resetPassword({ email, otp: verifiedOtp, newPassword });
      toast.success('Password berhasil direset!');
      router.push('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mereset password';
      if (msg.includes('OTP')) {
        toast.error(msg);
        setStep(2);
        setOtp(['', '', '', '', '', '']);
        setVerifiedOtp('');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Lupa Password</h1>
        {step === 1 && <p className="text-sm text-gray-500 mt-1">Masukkan email akun Anda</p>}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-500 mt-1">Masukkan kode OTP yang dikirim ke</p>
            <p className="text-sm font-medium text-pink-600 mt-0.5">{email}</p>
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-sm text-gray-500 mt-1">Buat password baru untuk</p>
            <p className="text-sm font-medium text-pink-600 mt-0.5">{email}</p>
          </>
        )}
      </div>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
                emailError ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="nama@email.com"
            />
            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>

          <button
            type="submit"
            disabled={isCheckingEmail}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white cursor-pointer text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingEmail ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memeriksa...
              </>
            ) : (
              'Lanjutkan'
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-11 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            ))}
          </div>
          {otpError && <p className="text-sm text-red-600 text-center">{otpError}</p>}

          <button
            type="submit"
            disabled={isVerifyingOtp || otp.join('').length !== 6}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white cursor-pointer text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifyingOtp ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memverifikasi...
              </>
            ) : (
              'Verifikasi'
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
          >
            Ganti email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
                  passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.newPassword ? (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">Minimal 8 karakter</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 ${
                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white cursor-pointer text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Password Baru'
            )}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        Ingat password?{' '}
        <Link href="/login" className="text-pink-600 font-medium hover:text-pink-700">
          Masuk
        </Link>
      </p>
    </div>
  );
}
