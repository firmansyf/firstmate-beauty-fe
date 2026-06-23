import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import JsonLd from '@/components/common/JsonLd';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://firstmatebeauties.com/" ;
const ogImage = `${siteUrl}/logo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FirstMate Beauty - Jual Beli Produk Skincare Online',
    template: '%s | FirstMate Beauty',
  },
  description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau. Temukan produk perawatan kulit original dengan harga terbaik.',
  keywords: ['skincare', 'perawatan kulit', 'kosmetik', 'kecantikan', 'FirstMate Beauty', 'jual skincare', 'beli skincare online'],
  authors: [{ name: 'FirstMate Beauty' }],
  creator: 'FirstMate Beauty',
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
    siteName: 'FirstMate Beauty',
    title: 'FirstMate Beauty - Jual Beli Produk Skincare Online',
    description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau.',
    images: [
      {
        url: ogImage,
        width: 480,
        height: 510,
        alt: 'FirstMate Beauty',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'FirstMate Beauty - Jual Beli Produk Skincare Online',
    description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau.',
    images: [ogImage],
  },
  icons: {
    icon: [{ url: '/logoPav.png', type: 'image/png' }],
    shortcut: '/logoPav.png',
    apple: '/logoPav.png',
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
            name: 'FirstMate Beauty',
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
            description: 'Platform jual-beli skincare terpercaya dengan kualitas terbaik dan harga terjangkau.',
            sameAs: [],
          }}
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