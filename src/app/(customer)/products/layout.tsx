import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produk Skincare',
  description: 'Temukan produk skincare terbaik untuk kulit Anda. Berbagai pilihan produk perawatan kulit berkualitas dengan harga terjangkau.',
  keywords: ['produk skincare', 'beli skincare', 'perawatan kulit', 'kosmetik online', 'alfath skin produk'],
  openGraph: {
    title: 'Produk Skincare | Alfath Skin',
    description: 'Temukan produk skincare terbaik untuk kulit Anda.',
    type: 'website',
  },
  alternates: {
    canonical: '/products',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
