// /src/pages/FoodTruckQRPage.jsx
// Printable QR code page for food truck operators
// Route: /food-trucks/qr/:slug
// No navbar/footer — designed for window/counter printing

import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { C } from '../data/config';

function toTitleCase(str) {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function FoodTruckQRPage() {
  const { slug } = useParams();
  const truckName = toTitleCase(slug || 'food-truck');
  const pageUrl = `${window.location.origin}/food-trucks${slug ? `?truck=${slug}` : ''}`;

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0.5in; size: letter; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body { margin: 0; background: ${C.cream}; }
      `}</style>

      {/* Print button — hidden on print */}
      <div className="no-print" style={{
        position: 'fixed', top: 16, right: 16, zIndex: 10,
      }}>
        <button
          onClick={() => window.print()}
          style={{
            background: C.dusk, color: C.cream,
            border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 14,
            fontFamily: "'Libre Franklin', sans-serif",
            cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          Print / Save PDF
        </button>
      </div>

      {/* Printable card */}
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.cream, fontFamily: "'Libre Franklin', sans-serif",
        padding: 32,
      }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${C.sand}`,
          borderRadius: 20,
          padding: '52px 48px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}>
          {/* Eyebrow */}
          <p style={{
            margin: '0 0 8px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.sage,
            fontWeight: 600,
          }}>
            Manitou Beach · Food Trucks
          </p>

          {/* Truck name */}
          <h1 style={{
            margin: '0 0 28px',
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 30,
            color: C.dusk,
            lineHeight: 1.2,
          }}>
            {truckName}
          </h1>

          {/* QR code */}
          <div style={{
            display: 'inline-block',
            border: `3px solid ${C.sand}`,
            borderRadius: 12,
            padding: 12,
            marginBottom: 24,
            background: C.cream,
          }}>
            <QRCode
              value={pageUrl}
              size={280}
              fgColor="#2D3B45"
              bgColor="#FAF6EF"
              style={{ display: 'block', borderRadius: 6 }}
            />
          </div>

          {/* Follow CTA */}
          <p style={{
            margin: '0 0 6px',
            fontSize: 20,
            color: C.sunset,
          }}>
            📱
          </p>
          <p style={{
            margin: '0 0 4px',
            fontSize: 17,
            fontWeight: 700,
            color: C.dusk,
          }}>
            Follow us — get a text when we're here.
          </p>
          <p style={{
            margin: '0 0 24px',
            fontSize: 14,
            color: C.textLight,
            lineHeight: 1.5,
          }}>
            Scan to find {truckName} on the Manitou Beach<br />
            Locator. Heart us once &amp; we'll text you next time we drop our pin.
          </p>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.sand}`, margin: '0 0 16px' }} />

          {/* URL */}
          <p style={{
            margin: 0,
            fontSize: 12,
            color: C.textLight,
            letterSpacing: '0.04em',
          }}>
            manitou-beach.vercel.app/food-trucks
          </p>
        </div>
      </div>
    </>
  );
}
