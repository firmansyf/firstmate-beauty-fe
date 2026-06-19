// src/app/(customer)/checkout/page.tsx
'use client';

import Loader from '@/components/common/Loader';
import { ordersAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Select, { SingleValue, StylesConfig } from 'react-select';

const WILAYAH_API = `${process.env.NEXT_PUBLIC_API_URL}/wilayah`;

interface Region {
  id: string;
  name: string;
  postal_code?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SelectOption {
  value: string;
  label: string;
}

const selectStyles = (error?: string): StylesConfig<SelectOption, false> => ({
  control: (base, state) => ({
    ...base,
    borderColor: error ? '#ef4444' : state.isFocused ? '#ec4899' : '#e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: 'none',
    fontSize: '0.875rem',
    minHeight: '38px',
    backgroundColor: state.isDisabled ? '#f9fafb' : 'white',
    '&:hover': { borderColor: error ? '#ef4444' : '#ec4899' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected
      ? '#ec4899'
      : state.isFocused
      ? '#fce7f3'
      : 'white',
    color: state.isSelected ? 'white' : '#111827',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#f9a8d4' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    border: '1px solid #f3f4f6',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '0.875rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#111827',
    fontSize: '0.875rem',
  }),
  input: (base) => ({
    ...base,
    color: '#111827',
    fontSize: '0.875rem',
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: '0.875rem',
    color: '#6b7280',
  }),
  loadingMessage: (base) => ({
    ...base,
    fontSize: '0.875rem',
    color: '#6b7280',
  }),
});

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (id: string, name: string) => void;
  options: Region[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}) {
  const opts: SelectOption[] = (Array.isArray(options) ? options : []).map((o) => ({
    value: o.id,
    label: o.name,
  }));

  const selected = opts.find((o) => o.value === value) ?? null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select<SelectOption>
        instanceId={label}
        value={selected}
        onChange={(opt: SingleValue<SelectOption>) =>
          onChange(opt?.value ?? '', opt?.label ?? '')
        }
        options={opts}
        placeholder={placeholder}
        isDisabled={disabled || loading}
        isLoading={loading}
        isSearchable
        styles={selectStyles(error)}
        noOptionsMessage={() => 'Tidak ada pilihan'}
        loadingMessage={() => 'Memuat...'}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, subtotal, fetchCart, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    recipient_name: '',
    phone: '',
    customer_notes: '',
  });

  const [address, setAddress] = useState({
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    district_id: '',
    district_name: '',
    village_id: '',
    village_name: '',
    postal_code: '',
    detail: '',
  });

  const [regions, setRegions] = useState<{
    provinces: Region[];
    cities: Region[];
    districts: Region[];
    villages: Region[];
  }>({ provinces: [], cities: [], districts: [], villages: [] });

  const [loadingRegion, setLoadingRegion] = useState({
    provinces: true,
    cities: false,
    districts: false,
    villages: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const loadData = async () => {
      await fetchCart();
      setIsLoading(false);
    };
    loadData();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        recipient_name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user, router, fetchCart]);

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [isLoading, items, router]);

  // Load provinces on mount
  useEffect(() => {
    fetch(`${WILAYAH_API}/provinces`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('invalid response');
        setRegions((prev) => ({ ...prev, provinces: data as Region[] }));
      })
      .catch(() => toast.error('Gagal memuat data provinsi'))
      .finally(() => setLoadingRegion((prev) => ({ ...prev, provinces: false })));
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!address.province_id) return;
    setLoadingRegion((prev) => ({ ...prev, cities: true }));
    setRegions((prev) => ({ ...prev, cities: [], districts: [], villages: [] }));
    setAddress((prev) => ({
      ...prev,
      city_id: '', city_name: '',
      district_id: '', district_name: '',
      village_id: '', village_name: '',
      postal_code: '',
    }));
    fetch(`${WILAYAH_API}/cities/${address.province_id}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('invalid response');
        setRegions((prev) => ({ ...prev, cities: data as Region[] }));
      })
      .catch(() => toast.error('Gagal memuat data kota/kabupaten'))
      .finally(() => setLoadingRegion((prev) => ({ ...prev, cities: false })));
  }, [address.province_id]);

  // Load districts when city changes
  useEffect(() => {
    if (!address.city_id) return;
    setLoadingRegion((prev) => ({ ...prev, districts: true }));
    setRegions((prev) => ({ ...prev, districts: [], villages: [] }));
    setAddress((prev) => ({
      ...prev,
      district_id: '', district_name: '',
      village_id: '', village_name: '',
      postal_code: '',
    }));
    fetch(`${WILAYAH_API}/districts/${address.city_id}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('invalid response');
        setRegions((prev) => ({ ...prev, districts: data as Region[] }));
      })
      .catch(() => toast.error('Gagal memuat data kecamatan'))
      .finally(() => setLoadingRegion((prev) => ({ ...prev, districts: false })));
  }, [address.city_id]);

  // Load villages when district changes, auto-fill postal code
  useEffect(() => {
    if (!address.district_id) return;
    setLoadingRegion((prev) => ({ ...prev, villages: true }));
    setRegions((prev) => ({ ...prev, villages: [] }));
    setAddress((prev) => ({
      ...prev,
      village_id: '', village_name: '',
      postal_code: '',
    }));
    fetch(`${WILAYAH_API}/villages/${address.district_id}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('invalid response');
        setRegions((prev) => ({ ...prev, villages: data as Region[] }));
      })
      .catch(() => toast.error('Gagal memuat data desa/kelurahan'))
      .finally(() => setLoadingRegion((prev) => ({ ...prev, villages: false })));
  }, [address.district_id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipient_name) newErrors.recipient_name = 'Nama penerima wajib diisi';
    if (!formData.phone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    if (!address.province_id) newErrors.province = 'Provinsi wajib dipilih';
    if (!address.city_id) newErrors.city = 'Kota/Kabupaten wajib dipilih';
    if (!address.district_id) newErrors.district = 'Kecamatan wajib dipilih';
    if (!address.village_id) newErrors.village = 'Desa/Kelurahan wajib dipilih';
    if (!address.detail.trim()) newErrors.detail = 'Alamat detail wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildShippingAddress = () => {
    const parts: string[] = [];
    if (address.detail.trim()) parts.push(address.detail.trim());
    if (address.village_name) parts.push(`Kel. ${address.village_name}`);
    if (address.district_name) parts.push(`Kec. ${address.district_name}`);
    if (address.city_name) parts.push(address.city_name);
    if (address.province_name) parts.push(address.province_name);
    if (address.postal_code) parts.push(address.postal_code);
    parts.push('Indonesia');
    return parts.join(', ');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await ordersAPI.create({
        ...formData,
        shipping_address: buildShippingAddress(),
        shipping_cost: 10000,
      });
      const orderId = response.data.data.id;
      await clearCart();
      toast.success('Pesanan dibuat! Silakan lakukan pembayaran via QRIS.');
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-white"
      >
        <Loader size="lg" />
      </motion.div>
    );
  }

  const shippingCost = 10000;
  const total = subtotal + shippingCost;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
            Kembali ke Keranjang
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-2xl font-semibold text-gray-900 mb-6"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-6"
            >
              {/* Shipping Info */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-lg border border-gray-100 p-5"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Pengiriman</h2>

                <div className="space-y-4">
                  {/* Recipient & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Nama Penerima <span className="text-red-500">*</span>
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.recipient_name}
                        onChange={(e) =>
                          setFormData({ ...formData, recipient_name: e.target.value })
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all ${
                          errors.recipient_name ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Nama lengkap"
                      />
                      <AnimatePresence>
                        {errors.recipient_name && (
                          <motion.p
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.recipient_name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        No. Telepon <span className="text-red-500">*</span>
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all ${
                          errors.phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="08123456789"
                      />
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.phone}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Address Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Alamat Pengiriman <span className="text-red-500">*</span>
                    </p>

                    {/* Country (readonly) */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Negara</label>
                      <input
                        type="text"
                        value="Indonesia"
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 bg-gray-50 cursor-default focus:outline-none"
                      />
                    </div>

                    {/* Province & City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectField
                        label="Provinsi"
                        required
                        value={address.province_id}
                        onChange={(id, name) =>
                          setAddress((prev) => ({ ...prev, province_id: id, province_name: name }))
                        }
                        options={regions.provinces}
                        placeholder="Pilih provinsi"
                        loading={loadingRegion.provinces}
                        error={errors.province}
                      />
                      <SelectField
                        label="Kota / Kabupaten"
                        required
                        value={address.city_id}
                        onChange={(id, name) =>
                          setAddress((prev) => ({ ...prev, city_id: id, city_name: name }))
                        }
                        options={regions.cities}
                        placeholder="Pilih kota/kabupaten"
                        disabled={!address.province_id}
                        loading={loadingRegion.cities}
                        error={errors.city}
                      />
                    </div>

                    {/* District & Village */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectField
                        label="Kecamatan"
                        required
                        value={address.district_id}
                        onChange={(id, name) =>
                          setAddress((prev) => ({ ...prev, district_id: id, district_name: name }))
                        }
                        options={regions.districts}
                        placeholder="Pilih kecamatan"
                        disabled={!address.city_id}
                        loading={loadingRegion.districts}
                        error={errors.district}
                      />
                      <SelectField
                        label="Desa / Kelurahan"
                        required
                        value={address.village_id}
                        onChange={(id, name) => {
                          const village = regions.villages.find((v) => v.id === id);
                          setAddress((prev) => ({
                            ...prev,
                            village_id: id,
                            village_name: name,
                            postal_code: village?.postal_code ?? prev.postal_code,
                          }));
                        }}
                        options={regions.villages}
                        placeholder="Pilih desa/kelurahan"
                        disabled={!address.district_id}
                        loading={loadingRegion.villages}
                        error={errors.village}
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={address.postal_code}
                        onChange={(e) =>
                          setAddress((prev) => ({ ...prev, postal_code: e.target.value }))
                        }
                        maxLength={5}
                        className="w-full sm:w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all"
                        placeholder="12345"
                      />
                    </div>

                    {/* Detail address */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Alamat Detail <span className="text-red-500">*</span>
                      </label>
                      <motion.textarea
                        whileFocus={{ scale: 1.005 }}
                        value={address.detail}
                        onChange={(e) =>
                          setAddress((prev) => ({ ...prev, detail: e.target.value }))
                        }
                        rows={2}
                        className={`w-full px-3 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none transition-all ${
                          errors.detail ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan, dll"
                      />
                      <AnimatePresence>
                        {errors.detail && (
                          <motion.p
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-lg border border-gray-100 p-5"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Catatan (Opsional)</h2>
                <motion.textarea
                  whileFocus={{ scale: 1.005 }}
                  value={formData.customer_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none transition-all"
                  placeholder="Catatan: skin type, preferensi kemasan, dll"
                />
              </motion.div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-20 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-lg border border-gray-100 p-5"
                >
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>

                  {/* Items */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.name}
                          {item.variant_name ? ` - ${item.variant_name}` : ''} x{item.quantity}
                        </span>
                        <span className="text-gray-900">
                          {formatCurrency((item.discount_price || item.price) * item.quantity)}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-between text-gray-600"
                    >
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 }}
                      className="flex justify-between text-gray-600"
                    >
                      <span>Ongkir</span>
                      <span>{formatCurrency(shippingCost)}</span>
                    </motion.div>
                    <hr className="border-gray-100" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring' }}
                      className="flex justify-between"
                    >
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-pink-600">{formatCurrency(total)}</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                        Memproses...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Buat Pesanan
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </main>
  );
}
