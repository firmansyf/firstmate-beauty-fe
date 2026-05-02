'use client';

import { feedbackAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Star, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'general', label: 'Umum' },
  { value: 'praise', label: 'Pujian 😊' },
  { value: 'suggestion', label: 'Saran 💡' },
  { value: 'bug', label: 'Masalah/Bug 🐛' },
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const reset = () => {
    setRating(0);
    setCategory('general');
    setMessage('');
    setHoveredStar(0);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!message.trim()) {
      toast.error('Pesan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackAPI.submit({
        name: user.name,
        email: user.email || undefined,
        rating: rating || undefined,
        category,
        message: message.trim(),
      });
      toast.success('Terima kasih atas feedback Anda!');
      reset();
      onClose();
    } catch (error) {
      toast.error('Gagal mengirim feedback, coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Kirim Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">Bantu kami meningkatkan layanan</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (opsional)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className="w-7 h-7 transition-colors"
                    fill={(hoveredStar || rating) >= star ? '#f59e0b' : 'none'}
                    stroke={(hoveredStar || rating) >= star ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-gray-400 hover:text-gray-600 self-center"
                >
                  hapus
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 cursor-pointer py-2 text-xs font-medium rounded-lg border transition-colors text-left ${
                    category === cat.value
                      ? 'bg-pink-50 border-pink-300 text-pink-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pesan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan pengalaman atau saran Anda..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
