import BannerSlider from '@/components/customer/BannerSlider';
import ProductCard from '@/components/customer/ProductCard';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${apiUrl}/products?limit=8`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getActiveBanners() {
  try {
    const res = await fetch(`${apiUrl}/banners`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, banners] = await Promise.all([
    getFeaturedProducts(),
    getActiveBanners(),
  ]);

  return (
    <main className="bg-white">
      {/* Hero Banner Section */}
      <section className="pt-6 pb-8 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {banners.length > 0 ? (
            <BannerSlider banners={banners} />
          ) : (
            <div className="relative w-full min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400" />

              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
                }}
              />

              <div className="relative z-10 h-full flex items-center">
                <div className="w-full px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-xs font-medium text-white/90 tracking-wide">
                        Skincare Terpercaya
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight mb-4">
                      <span className="text-white tracking-wide">Kulitmu</span>
                      <br />
                      <span className="text-pink-100 drop-shadow-sm tracking-wide">Kemenanganmu!</span>
                    </h1>

                    <p className="text-white/80 text-base sm:text-lg mb-8 max-w-md leading-relaxed">
                      Produk skincare berkualitas, diantar langsung ke rumah Anda.
                    </p>

                    <Link
                      href="/products"
                      className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-pink-700 font-semibold text-sm rounded-full shadow-lg shadow-pink-900/20 hover:shadow-xl hover:shadow-pink-900/25 hover:bg-pink-50 transition-all duration-300"
                    >
                      Lihat Produk
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="relative w-48 h-48 xl:w-56 xl:h-56">
                    <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" />
                    <div className="absolute inset-4 rounded-full bg-white/15 border border-white/10" />
                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-pink-200/30 to-rose-300/20 flex items-center justify-center">
                      <span className="text-5xl">🧴</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Produk Pilihan
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl mb-4 block">✨</span>
              <p className="text-gray-500">Belum ada produk tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500" />

        <div className="hidden lg:flex absolute left-8 xl:left-16 top-1/2 -translate-y-1/2 flex-col gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[-8deg]">
            <span className="text-2xl">🧴</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[5deg] ml-6">
            <span className="text-xl">💆</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[-3deg]">
            <span className="text-lg">🌿</span>
          </div>
        </div>

        <div className="hidden lg:flex absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 flex-col gap-4 items-end">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[8deg]">
            <span className="text-xl">✨</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[-5deg] mr-6">
            <span className="text-2xl">💧</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[3deg]">
            <span className="text-lg">🌸</span>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/25">
            <Heart className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Siap merawat kulit Anda?
          </h2>

          <p className="text-lg sm:text-xl text-white/85 mb-10 max-w-xl mx-auto leading-relaxed">
            Pesan sekarang dan rasakan manfaat skincare berkualitas kami
          </p>

          <Link
            href="/products"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-pink-700 font-semibold text-base rounded-full shadow-xl shadow-pink-900/25 hover:shadow-2xl hover:shadow-pink-900/30 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative">Pesan Sekarang</span>
            <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <div className="mt-10 flex items-center justify-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
              Produk terpercaya
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
              100% Original
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
              Siap antar
            </span>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>
    </main>
  );
}
