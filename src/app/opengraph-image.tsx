import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Alfath Skin - Jual Beli Produk Skincare Online';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  // Fetch logo from public folder
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alfath-skin-production.up.railway.app';
  let logoSrc: string | null = null;
  try {
    const res = await fetch(`${baseUrl}/logo.png`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      const base64 = Buffer.from(buf).toString('base64');
      logoSrc = `data:image/png;base64,${base64}`;
    }
  } catch {
    // logo not available, fallback to text only
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f43f5e 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '24px',
            padding: '56px 80px',
            maxWidth: '900px',
            width: '100%',
          }}
        >
          {/* Logo or text */}
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt="Alfath Skin"
              width={240}
              height={100}
              style={{ objectFit: 'contain', marginBottom: '24px' }}
            />
          ) : (
            <div
              style={{
                fontSize: '64px',
                fontWeight: 800,
                color: 'white',
                marginBottom: '20px',
                letterSpacing: '-1px',
              }}
            >
              Alfath Skin
            </div>
          )}

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              lineHeight: 1.4,
              marginBottom: '32px',
              maxWidth: '600px',
            }}
          >
            Platform jual-beli skincare terpercaya dengan kualitas terbaik
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {['100% Original', 'Harga Terjangkau', 'Siap Antar'].map((text) => (
              <div
                key={text}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Decorations */}
        <div style={{ position: 'absolute', top: '40px', left: '60px', fontSize: '48px', opacity: 0.6 }}>🧴</div>
        <div style={{ position: 'absolute', top: '60px', right: '80px', fontSize: '40px', opacity: 0.5 }}>💧</div>
        <div style={{ position: 'absolute', bottom: '50px', left: '80px', fontSize: '36px', opacity: 0.5 }}>🌸</div>
        <div style={{ position: 'absolute', bottom: '40px', right: '70px', fontSize: '44px', opacity: 0.6 }}>✨</div>
      </div>
    ),
    { ...size }
  );
}
