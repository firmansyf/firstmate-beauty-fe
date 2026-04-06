import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Alfath Skin - Jual Beli Produk Skincare Online';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
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
        {/* Background pattern dots */}
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
            padding: '60px 80px',
            backdropFilter: 'blur(10px)',
            maxWidth: '900px',
            width: '100%',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '8px 20px',
              marginBottom: '28px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <span style={{ fontSize: '18px' }}>✨</span>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>
              Skincare Terpercaya
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.1,
              marginBottom: '20px',
              letterSpacing: '-1px',
            }}
          >
            Alfath Skin
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
              lineHeight: 1.4,
              marginBottom: '36px',
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

        {/* Emoji decorations */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '60px',
            fontSize: '48px',
            opacity: 0.6,
          }}
        >
          🧴
        </div>
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '80px',
            fontSize: '40px',
            opacity: 0.5,
          }}
        >
          💧
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '80px',
            fontSize: '36px',
            opacity: 0.5,
          }}
        >
          🌸
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '70px',
            fontSize: '44px',
            opacity: 0.6,
          }}
        >
          ✨
        </div>
      </div>
    ),
    { ...size }
  );
}
