'use client';

import { feedbackAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MessageSquarePlus, Star, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'general', label: 'Umum' },
  { value: 'praise', label: 'Pujian 😊' },
  { value: 'suggestion', label: 'Saran 💡' },
  { value: 'bug', label: 'Masalah/Bug 🐛' },
];

export default function FeedbackButton() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rating: 0,
    category: 'general',
    message: '',
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleOpen = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      rating: 0,
      category: 'general',
      message: '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error('Nama dan pesan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackAPI.submit({
        name: form.name,
        email: form.email || undefined,
        rating: form.rating || undefined,
        category: form.category,
        message: form.message,
      });
      toast.success('Terima kasih atas feedback Anda!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Gagal mengirim feedback, coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 px-4 py-3 bg-pink-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-pink-700 transition-all duration-200 hover:shadow-xl"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Kirim Feedback</h2>
                <p className="text-xs text-gray-500 mt-0.5">Bantu kami meningkatkan layanan</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (opsional)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className="w-7 h-7 transition-colors"
                        fill={(hoveredStar || form.rating) >= star ? '#f59e0b' : 'none'}
                        stroke={(hoveredStar || form.rating) >= star ? '#f59e0b' : '#d1d5db'}
                      />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, rating: 0 })}
                      className="ml-2 text-xs text-gray-400 hover:text-gray-600 self-center"
                    >
                      hapus
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-left ${
                        form.category === cat.value
                          ? 'bg-pink-50 border-pink-300 text-pink-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Anda"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email (opsional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Ceritakan pengalaman atau saran Anda..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
