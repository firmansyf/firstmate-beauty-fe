import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import JsonLd from '@/components/common/JsonLd';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alfath-skin.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Alfath Skin - Jual Beli Produk Skincare Online',
    template: '%s | Alfath Skin',
  },
  description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau. Temukan produk perawatan kulit original dengan harga terbaik.',
  keywords: ['skincare', 'perawatan kulit', 'kosmetik', 'kecantikan', 'alfath skin', 'jual skincare', 'beli skincare online'],
  authors: [{ name: 'Alfath Skin' }],
  creator: 'Alfath Skin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'Alfath Skin',
    title: 'Alfath Skin - Jual Beli Produk Skincare Online',
    description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Alfath Skin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alfath Skin - Jual Beli Produk Skincare Online',
    description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Alfath Skin',
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
            description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau.',
            sameAs: [],
          }}
        />
        <Script
          src={
            process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
              ? 'https://app.midtrans.com/snap/snap.js'
              : 'https://app.sandbox.midtrans.com/snap/snap.js'
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}