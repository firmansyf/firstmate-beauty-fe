import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://first-mate-beauty-production.up.railway.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/products/'],
        disallow: [
          '/admin',
          '/cart',
          '/checkout',
          '/orders',
          '/profile',
          '/refunds',
          '/login',
          '/register',
          '/verify-otp',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
