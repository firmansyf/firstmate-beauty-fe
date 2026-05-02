// src/app/admin/products/new/page.tsx
'use client';

import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import RichTextEditor from '@/components/common/RichTextEditor';
import { productsAPI, uploadAPI } from '@/lib/api';
import { ChevronLeft, ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminCreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    unit: 'pcs',
    category_id: '',
    image_url: '',
    images: [] as string[],
    brand: '',
    masa_penyimpanan: '',
    jenis_kulit: [] as string[],
    is_available: true,
    variants: [] as Array<{
      name: string;
      price: string;
      discount_price: string;
      stock: string;
      image_url: string;
    }>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', price: '', discount_price: '', stock: '0', image_url: '' }],
    }));
  };

  const updateVariant = (index: number, patch: Partial<{ name: string; price: string; discount_price: string; stock: string; image_url: string }>) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadProductImage(file);
      setFormData({ ...formData, image_url: response.data.data.url });
      toast.success('Gambar berhasil diupload');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (files: FileList | File[]) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (!allowedTypes.includes(f.type)) {
        toast.error(`${f.name}: format tidak didukung`);
        continue;
      }
      if (f.size > maxSize) {
        toast.error(`${f.name}: ukuran melebihi 5MB`);
        continue;
      }
      valid.push(f);
    }
    if (!valid.length) return;

    setIsUploadingGallery(true);
    try {
      const uploaded = await Promise.all(
        valid.map((f) => uploadAPI.uploadProductImage(f).then((r) => r.data.data.url as string))
      );
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast.success(`${uploaded.length} gambar berhasil diupload`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload gambar');
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Nama produk wajib diisi';
    if (!formData.slug) newErrors.slug = 'Slug wajib diisi';
    if (!formData.price) newErrors.price = 'Harga wajib diisi';
    if (!formData.stock) newErrors.stock = 'Stok wajib diisi';
    if (!formData.category_id) newErrors.category_id = 'Kategori wajib dipilih';

    if (formData.price && parseFloat(formData.price) <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }

    if (formData.discount_price && parseFloat(formData.discount_price) >= parseFloat(formData.price)) {
      newErrors.discount_price = 'Harga diskon harus lebih kecil dari harga normal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        jenis_kulit: formData.jenis_kulit.join(','),
        variants: formData.variants
          .filter((v) => v.name.trim() && v.price !== '')
          .map((v, idx) => ({
            name: v.name.trim(),
            price: parseFloat(v.price),
            discount_price: v.discount_price ? parseFloat(v.discount_price) : null,
            stock: parseInt(v.stock || '0'),
            image_url: v.image_url || null,
            display_order: idx,
          })),
      };

      await productsAPI.create(payload);
      toast.success('Produk berhasil ditambahkan');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center cursor-pointer gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali
      </button>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">Tambah Produk Baru</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Informasi Produk</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Contoh: Serum Vitamin C 20ml"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="serum-vitamin-c-20ml"
                  />
                  <p className="mt-1 text-xs text-gray-500">URL-friendly version dari nama produk</p>
                  {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Deskripsi
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Deskripsikan produk, kandungan, manfaat, cara penggunaan..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Harga Normal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                        errors.price ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="25000"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Harga Diskon
                    </label>
                    <input
                      type="number"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                        errors.discount_price ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="20000 (opsional)"
                    />
                    {errors.discount_price && <p className="mt-1 text-sm text-red-600">{errors.discount_price}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                        errors.stock ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="100"
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                    >
                      <option value="pcs">Pcs</option>
                      <option value="ml">ml</option>
                      <option value="gram">Gram</option>
                      <option value="bottle">Botol</option>
                      <option value="tube">Tube</option>
                      <option value="jar">Jar</option>
                      <option value="sachet">Sachet</option>
                      <option value="pack">Pack</option>
                      <option value="set">Set</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Detail Produk</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                      placeholder="Contoh: Wardah, Skintific"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Masa Penyimpanan
                    </label>
                    <input
                      type="text"
                      value={formData.masa_penyimpanan}
                      onChange={(e) => setFormData({ ...formData, masa_penyimpanan: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                      placeholder="Contoh: 12 bulan setelah dibuka"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Jenis Kulit
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Normal', 'Kering', 'Berminyak', 'Kombinasi', 'Sensitif', 'Berjerawat'].map((tipe) => {
                      const checked = formData.jenis_kulit.includes(tipe);
                      return (
                        <label
                          key={tipe}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-full cursor-pointer transition-colors ${
                            checked
                              ? 'bg-pink-50 border-pink-400 text-pink-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...formData.jenis_kulit, tipe]
                                : formData.jenis_kulit.filter((t) => t !== tipe);
                              setFormData({ ...formData, jenis_kulit: next });
                            }}
                            className="hidden"
                          />
                          {tipe}
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Pilih satu atau lebih jenis kulit yang cocok</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Varian Produk</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tambah varian (mis. ukuran 30ml / 50ml). Jika ada varian, harga & stok varian akan dipakai saat checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Varian
                </button>
              </div>

              {formData.variants.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-xs text-gray-500">Belum ada varian. Produk akan dijual dengan harga & stok utama.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start p-3 border border-gray-200 rounded-lg">
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">Nama</label>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => updateVariant(idx, { name: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="50ml"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Harga</label>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(idx, { price: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="25000"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Harga Diskon</label>
                        <input
                          type="number"
                          value={v.discount_price}
                          onChange={(e) => updateVariant(idx, { discount_price: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="opsional"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Stok</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, { stock: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-10 sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">URL Gambar</label>
                        <input
                          type="url"
                          value={v.image_url}
                          onChange={(e) => updateVariant(idx, { image_url: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-pink-500"
                          placeholder="opsional"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer mt-5"
                          aria-label="Hapus varian"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Gambar Produk</h2>

              {/* Image Preview or Upload Area */}
              {formData.image_url ? (
                <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-video w-full rounded-lg border-2 border-dashed cursor-pointer transition-colors mb-4 ${
                    isDragging
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    {isUploading ? (
                      <>
                        <Loader size="md" />
                        <span className="text-sm mt-2">Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-2" />
                        <span className="text-sm font-medium text-gray-600">
                          Klik atau drag & drop gambar
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          JPEG, PNG, GIF, WebP (Maks. 5MB)
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* URL Input as alternative */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Atau masukkan URL gambar
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Galeri Gambar</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Tambahkan beberapa foto produk dari berbagai sudut</p>
                </div>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploadingGallery}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingGallery ? <Loader size="sm" /> : <Upload className="w-3.5 h-3.5" />}
                  Tambah Gambar
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {formData.images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">Belum ada gambar tambahan</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((url, idx) => (
                    <div
                      key={url + idx}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Kategori & Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-pink-500 ${
                      errors.category_id ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) =>
                        setFormData({ ...formData, is_available: e.target.checked })
                      }
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Produk Tersedia</span>
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-pink-50 border-pink-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>Gunakan nama produk yang jelas (sertakan ukuran/volume)</li>
                <li>Tambahkan deskripsi lengkap: kandungan, manfaat, cara pakai</li>
                <li>Gunakan foto produk berkualitas tinggi</li>
                <li>Cantumkan info skin type yang cocok di deskripsi</li>
              </ul>
            </Card>

            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size="sm" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Produk'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
