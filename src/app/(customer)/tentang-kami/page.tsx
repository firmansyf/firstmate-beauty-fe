import type { Metadata } from 'next';
import TentangKamiClient from '@/components/customer/TentangKamiClient';
import JsonLd from '@/components/common/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firstmatebeauties.com';

export const metadata: Metadata = {
  title: 'Tentang Kami | FirstMate Beauty',
  description:
    'Kenali FirstMate Beauty — toko skincare online terpercaya yang menyediakan produk perawatan kulit original, berkualitas, dan terjangkau. Produk terverifikasi BPOM dengan pembayaran QRIS yang mudah.',
  keywords: [
    'tentang firstmate beauty',
    'toko skincare terpercaya',
    'skincare original indonesia',
    'perawatan kulit online',
    'produk kecantikan original',
    'firstmate beauty',
    'skincare BPOM',
    'toko kecantikan online',
  ],
  alternates: {
    canonical: `${siteUrl}/tentang-kami`,
  },
  openGraph: {
    title: 'Tentang Kami | FirstMate Beauty',
    description:
      'FirstMate Beauty hadir sebagai teman setia perjalanan kecantikan Anda — produk skincare original, berkualitas, dan terjangkau langsung ke pintu Anda.',
    url: `${siteUrl}/tentang-kami`,
    siteName: 'FirstMate Beauty',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'FirstMate Beauty — Toko Skincare Terpercaya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tentang Kami | FirstMate Beauty',
    description:
      'Kenali FirstMate Beauty — toko skincare online dengan produk original, terverifikasi, dan terjangkau.',
    images: [`${siteUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FirstMate Beauty',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    'Toko skincare online terpercaya yang menyediakan produk perawatan kulit original, berkualitas, dan terjangkau untuk semua jenis kulit.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Indonesian',
  },
  sameAs: [],
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Tentang Kami — FirstMate Beauty',
  description:
    'Halaman tentang FirstMate Beauty, toko skincare online terpercaya Indonesia.',
  url: `${siteUrl}/tentang-kami`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'FirstMate Beauty',
    url: siteUrl,
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Apa itu FirstMate Beauty?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FirstMate Beauty adalah toko kecantikan online yang menyediakan produk skincare berkualitas tinggi yang telah diseleksi secara ketat, mulai dari pembersih wajah, pelembap, serum, hingga produk perlindungan matahari.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara memesan produk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pilih produk yang Anda inginkan, tambahkan ke keranjang, lalu lanjutkan ke checkout. Isi alamat pengiriman, pilih metode pembayaran QRIS, dan pesanan Anda akan segera diproses.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah produk yang dijual original?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ya, 100%. Kami hanya bekerja sama dengan distributor resmi dan brand terpercaya. Setiap produk telah melalui proses verifikasi keaslian sebelum sampai ke tangan Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa lama pengiriman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Estimasi pengiriman 1–5 hari kerja tergantung lokasi Anda. Setelah pesanan dikonfirmasi dan pembayaran terverifikasi, kami akan segera memproses dan mengirimkan paket Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana jika produk rusak saat tiba?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Jika produk rusak atau tidak sesuai, segera hubungi kami melalui WhatsApp atau ajukan permintaan refund melalui halaman Pesanan dalam 2×24 jam setelah produk diterima.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah bisa konsultasi produk sebelum membeli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tentu! Tim kami siap membantu Anda memilih produk yang paling sesuai dengan jenis dan kondisi kulit Anda melalui tombol WhatsApp yang tersedia di setiap halaman produk.',
      },
    },
  ],
};

export default function TentangKamiPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />
      <TentangKamiClient />
    </>
  );
}
