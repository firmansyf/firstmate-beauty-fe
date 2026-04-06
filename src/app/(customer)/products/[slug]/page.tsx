import type { Metadata } from 'next';
import ProductDetailClient from '@/components/customer/ProductDetailClient';
import JsonLd from '@/components/common/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Produk Tidak Ditemukan' };
  }

  const title = product.name;
  const description = product.description
    ? product.description.slice(0, 155)
    : `Beli ${product.name} original di Alfath Skin. Kualitas terjamin dengan harga terbaik.`;

  return {
    title,
    description,
    keywords: [product.name, product.category_name, 'skincare', 'perawatan kulit', 'alfath skin'].filter(Boolean),
    openGraph: {
      title: `${product.name} | Alfath Skin`,
      description,
      type: 'website',
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Alfath Skin`,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alfath-skin.vercel.app';

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || '',
        image: product.image_url || '',
        url: `${siteUrl}/products/${slug}`,
        offers: {
          '@type': 'Offer',
          price: product.discount_price || product.price,
          priceCurrency: 'IDR',
          availability:
            product.is_available && product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
        brand: {
          '@type': 'Brand',
          name: 'Alfath Skin',
        },
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ProductDetailClient slug={slug} />
    </>
  );
}
