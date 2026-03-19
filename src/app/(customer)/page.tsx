// src/app/(customer)/page.tsx
'use client';

import BannerSlider from '@/components/customer/BannerSlider';
import ProductCard from '@/components/customer/ProductCard';
import { bannersAPI, productsAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, bannersRes] = await Promise.all([
        productsAPI.getAll({ limit: 8 }),
        bannersAPI.getActive(),
      ]);
      setFeaturedProducts(productsRes.data.data);
      setBanners(bannersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white">
      {/* Hero Banner Section */}
      <section className="pt-6 pb-8 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Banner Skeleton */
            <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] lg:aspect-[4/1] bg-gray-200 rounded-xl overflow-hidden animate-pulse">
              <div className="absolute inset-0 flex items-center p-6 sm:p-8 lg:p-12">
                <div className="max-w-2xl space-y-4">
                  <div className="h-8 sm:h-10 md:h-12 bg-gray-300 rounded-lg w-3/4"></div>
                  <div className="h-4 sm:h-5 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-300 rounded-lg w-32 mt-4"></div>
                </div>
              </div>
            </div>
          ) : banners.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BannerSlider banners={banners} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] rounded-2xl overflow-hidden"
            >
              {/* Background with gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400" />
              
              {/* Decorative pattern overlay */}
              <div 
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {/* Floating decorative elements */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="absolute top-8 right-[15%] w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white/20 blur-3xl"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="absolute bottom-0 right-[30%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-rose-300/30 blur-3xl"
              />

              {/* Content container */}
              <div className="relative z-10 h-full flex items-center">
                <div className="w-full px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14">
                  <div className="max-w-xl">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-xs font-medium text-white/90 tracking-wide">
                        Skincare Terpercaya
                      </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight mb-4"
                    >
                      <span className="text-white tracking-wide">Kulitmu</span>
                      <br />
                      <span className="text-pink-100 drop-shadow-sm tracking-wide">Kemenanganmu!</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-white/80 text-base sm:text-lg mb-8 max-w-md leading-relaxed"
                    >
                      Produk skincare berkualitas, diantar langsung ke rumah Anda.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Link
                        href="/products"
                        className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-pink-700 font-semibold text-sm rounded-full shadow-lg shadow-pink-900/20 hover:shadow-xl hover:shadow-pink-900/25 hover:bg-pink-50 transition-all duration-300"
                      >
                        Lihat Produk
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  </div>
                </div>

                {/* Right side decorative skincare illustration */}
                <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
                    className="relative"
                  >
                    {/* Decorative circles representing skincare */}
                    <div className="relative w-48 h-48 xl:w-56 xl:h-56">
                      <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" />
                      <div className="absolute inset-4 rounded-full bg-white/15 border border-white/10" />
                      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-pink-200/30 to-rose-300/20 flex items-center justify-center">
                        <span className="text-5xl">🧴</span>
                      </div>
                    </div>

                    {/* Small floating accent */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="absolute -bottom-2 -left-6 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                    >
                      <span className="text-2xl">✨</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              Produk Pilihan
            </h2>
            <motion.div whileHover={{ x: 4 }}>
              <Link
                href="/products"
                className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="animate-pulse"
                >
                  <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.08, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-rose-300 blur-3xl"
        />
      </div>

      {/* Decorative skincare icons - left side */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden lg:flex absolute left-8 xl:left-16 top-1/2 -translate-y-1/2 flex-col gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[-8deg]">
          <span className="text-2xl">🧴</span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[5deg] ml-6">
          <span className="text-xl">💆</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[-3deg]">
          <span className="text-lg">🌿</span>
        </div>
      </motion.div>

      {/* Decorative skincare icons - right side */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden lg:flex absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 flex-col gap-4 items-end"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[8deg]">
          <span className="text-xl">✨</span>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[-5deg] mr-6">
          <span className="text-2xl">💧</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center rotate-[3deg]">
          <span className="text-lg">🌸</span>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/25"
        >
          <Heart className="w-7 h-7 text-white" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight"
        >
          Siap merawat kulit Anda?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg sm:text-xl text-white/85 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Pesan sekarang dan rasakan manfaat skincare berkualitas kami
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/products"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-pink-700 font-semibold text-base rounded-full shadow-xl shadow-pink-900/25 hover:shadow-2xl hover:shadow-pink-900/30 transition-all duration-300 overflow-hidden"
          >
            {/* Button hover background effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <span className="relative">Pesan Sekarang</span>
            <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 flex items-center justify-center gap-6 text-white/70 text-sm"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
            Gratis ongkir
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
            100% Original
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
            Siap antar
          </span>
        </motion.div>
      </div>

      {/* Top decorative border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.section>
    </main>
  );
}
