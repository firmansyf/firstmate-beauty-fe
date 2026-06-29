'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, Heart, Shield, Leaf, PackageCheck, QrCode, Sparkles } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';

const faqs = [
  {
    question: 'Apa itu FirstMate Beauty?',
    answer:
      'FirstMate Beauty adalah toko kecantikan online yang hadir untuk memenuhi kebutuhan perawatan kulit Anda. Kami menyediakan produk skincare berkualitas tinggi yang telah diseleksi secara ketat, mulai dari pembersih wajah, pelembap, serum, hingga produk perlindungan matahari.',
  },
  {
    question: 'Bagaimana cara memesan produk?',
    answer:
      'Pilih produk yang Anda inginkan, tambahkan ke keranjang, lalu lanjutkan ke checkout. Isi alamat pengiriman, pilih metode pembayaran QRIS, dan pesanan Anda akan segera diproses oleh tim kami.',
  },
  {
    question: 'Apakah produk yang dijual original?',
    answer:
      'Ya, 100%. Kami hanya bekerja sama dengan distributor resmi dan brand terpercaya. Setiap produk telah melalui proses verifikasi keaslian sebelum sampai ke tangan Anda.',
  },
  {
    question: 'Berapa lama pengiriman?',
    answer:
      'Estimasi pengiriman 1–5 hari kerja tergantung lokasi Anda. Setelah pesanan dikonfirmasi dan pembayaran terverifikasi, kami akan segera memproses dan mengirimkan paket Anda.',
  },
  {
    question: 'Bagaimana jika produk rusak saat tiba?',
    answer:
      'Kami bertanggung jawab atas kondisi produk saat sampai. Jika produk rusak atau tidak sesuai, segera hubungi kami melalui WhatsApp atau ajukan permintaan refund melalui halaman Pesanan Anda dalam 2×24 jam setelah produk diterima.',
  },
  {
    question: 'Apakah bisa konsultasi produk sebelum membeli?',
    answer:
      'Tentu! Tim kami siap membantu Anda memilih produk yang paling sesuai dengan jenis dan kondisi kulit Anda. Hubungi kami melalui tombol WhatsApp yang tersedia di setiap halaman produk.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Peduli Kulit Anda',
    description: 'Setiap produk dipilih dengan hati untuk memastikan keamanan dan kenyamanan kulit Anda.',
  },
  {
    icon: Shield,
    title: 'Terpercaya & Aman',
    description: 'Produk original bergaransi, dikemas dengan aman, dan dikirim dengan penuh tanggung jawab.',
  },
  {
    icon: Leaf,
    title: 'Ramah Lingkungan',
    description: 'Kami mendukung brand yang berkomitmen pada bahan-bahan alami dan praktik bisnis berkelanjutan.',
  },
];

const highlights = [
  {
    icon: PackageCheck,
    title: 'Produk Original',
    description: 'Setiap produk diverifikasi keasliannya. Tidak ada kompromi untuk kualitas.',
  },
  {
    icon: QrCode,
    title: 'Pembayaran Mudah',
    description: 'Bayar praktis dengan QRIS — aman, cepat, dan tanpa biaya tambahan.',
  },
  {
    icon: Sparkles,
    title: 'Kurated dengan Cermat',
    description: 'Hanya produk terpilih yang lolos seleksi ketat sebelum masuk ke toko kami.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
};

function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-pink-50 transition-colors duration-200"
      >
        <span className="font-medium text-gray-800 text-sm sm:text-base">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-pink-500" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export default function TentangKamiClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const highlightsRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const highlightsInView = useInView(highlightsRef, { once: true, margin: '-80px' });
  const storyInView = useInView(storyRef, { once: true, margin: '-80px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-80px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-white overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-pink-100/60 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-rose-100/50 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.span
            className="inline-block text-xs font-semibold tracking-widest text-pink-500 uppercase mb-4 bg-pink-100 px-4 py-1.5 rounded-full"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
          >
            Tentang Kami
          </motion.span>

          <motion.h1
            className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
          >
            Kecantikan yang{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              Terpercaya
            </span>
          </motion.h1>

          <motion.p
            className="max-w-2xl mx-auto text-gray-600 text-base sm:text-lg leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
          >
            FirstMate Beauty hadir sebagai teman setia perjalanan kecantikan Anda — menyediakan
            produk skincare berkualitas, original, dan terjangkau langsung ke pintu Anda.
          </motion.p>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-12 border-b border-gray-100" ref={highlightsRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {highlights.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                className="flex items-start gap-4 p-5 rounded-2xl bg-pink-50/60 border border-pink-100"
                variants={fadeUp}
                initial="hidden"
                animate={highlightsInView ? 'show' : 'hidden'}
                custom={i * 0.12}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24" ref={storyRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -48 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shadow-xl">
                <NextImage
                  src="/logo.png"
                  alt="FirstMate Beauty — toko skincare terpercaya"
                  width={280}
                  height={280}
                  className="object-contain p-8 drop-shadow-md"
                />
              </div>
              <motion.div
                className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={storyInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Heart className="w-10 h-10 text-white fill-white" />
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-5"
              initial={{ opacity: 0, x: 48 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cerita Kami</h2>
              <p className="text-gray-600 leading-relaxed">
                Berawal dari kecintaan terhadap dunia kecantikan dan keprihatinan terhadap
                banyaknya produk palsu yang beredar, FirstMate Beauty lahir dengan satu misi
                sederhana:{' '}
                <strong>menjadi teman kecantikan yang bisa dipercaya.</strong>
              </p>
              <p className="text-gray-600 leading-relaxed">
                Kami percaya bahwa setiap orang berhak mendapatkan produk perawatan kulit yang
                aman, efektif, dan terjangkau. Itulah mengapa kami hanya menjual produk yang
                telah terverifikasi keasliannya dan sesuai dengan regulasi BPOM.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 self-start bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md shadow-pink-200"
              >
                Lihat Produk Kami
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-pink-50/50 to-white" ref={valuesRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Nilai Kami</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Prinsip yang selalu kami jaga dalam setiap produk dan pelayanan.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                className="bg-white rounded-3xl p-7 flex flex-col gap-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                variants={fadeUp}
                initial="hidden"
                animate={valuesInView ? 'show' : 'hidden'}
                custom={i * 0.13}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-16 sm:py-24" ref={faqRef}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest text-pink-500 uppercase mb-3 bg-pink-50 px-4 py-1.5 rounded-full">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Pertanyaan yang Sering Ditanyakan
            </h2>
            <p className="text-gray-500">
              Tidak menemukan jawaban yang Anda cari? Hubungi kami langsung.
            </p>
          </SectionReveal>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={faqInView ? 'show' : 'hidden'}
                custom={i * 0.07}
              >
                <AccordionItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-pink-500 to-rose-500" ref={ctaRef}>
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          variants={fadeIn}
          initial="hidden"
          animate={ctaInView ? 'show' : 'hidden'}
          custom={0}
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-white mb-4"
            variants={fadeUp}
            initial="hidden"
            animate={ctaInView ? 'show' : 'hidden'}
            custom={0.05}
          >
            Siap Memulai Perjalanan Kecantikan Anda?
          </motion.h2>
          <motion.p
            className="text-pink-100 mb-8 leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            animate={ctaInView ? 'show' : 'hidden'}
            custom={0.15}
          >
            Temukan ratusan produk skincare pilihan yang cocok untuk jenis kulit Anda.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={ctaInView ? 'show' : 'hidden'}
            custom={0.25}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-pink-600 font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-pink-50 transition-colors shadow-lg"
            >
              Mulai Belanja
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
