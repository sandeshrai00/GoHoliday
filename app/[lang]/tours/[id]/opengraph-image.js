import { ImageResponse } from 'next/og';
import { getDb } from '@/lib/turso';
import { tours as toursSchema } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Provide localized texts manually since i18n dictionary might require heavy fs operations
function getLocalizedField(obj, fieldBase, lang) {
    if (!obj) return '';
    const langField = `${fieldBase}_${lang}`;
    if (obj[langField]) return obj[langField];
    return obj[fieldBase] || '';
}

export const alt = 'GoHoliday Tour Package';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
    const { id, lang } = params;

    // Fetch tour data
    let tour = null;
    try {
        const db = getDb();
        const result = await db.select().from(toursSchema).where(eq(toursSchema.id, Number(id)));
        if (result && result.length > 0) {
            tour = result[0];
        }
    } catch (err) {
        console.error('OG Image generation error:', err);
    }

    if (!tour) {
        return new ImageResponse(
            (
                <div style={{ background: '#0f172a', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: 'white', fontSize: 64, fontWeight: 900, textTransform: 'uppercase' }}>GoHoliday</h1>
                </div>
            ),
            { ...size }
        );
    }

    const localizedTitle = getLocalizedField(tour, 'title', lang);
    const localizedLocation = getLocalizedField(tour, 'location', lang);
    const finalPrice = tour.is_discount_active && tour.discount_percentage
        ? (tour.price - (tour.price * (tour.discount_percentage / 100))).toFixed(2)
        : tour.price;

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '80px',
                    color: 'white',
                    position: 'relative',
                    fontFamily: 'sans-serif'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                    <div style={{ display: 'flex', marginBottom: '25px', gap: '20px' }}>
                        <span style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {localizedLocation}
                        </span>
                        <span style={{ background: 'transparent', border: '3px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {tour.duration}
                        </span>
                    </div>

                    <h1 style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.1, marginBottom: '25px', maxWidth: '950px', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                        {localizedTitle}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                        <span style={{ fontSize: 32, fontWeight: 500, color: 'rgba(255,255,255,0.7)', paddingBottom: '8px' }}>from</span>
                        <span style={{ fontSize: 64, fontWeight: 900, color: '#f59e0b' }}>
                            {tour.currency} {finalPrice}
                        </span>
                    </div>
                </div>

                {/* Brand Overlay */}
                <div style={{ position: 'absolute', top: 70, right: 80, fontSize: 42, fontWeight: 900, letterSpacing: '-2px', color: 'white' }}>
                    GoHoliday
                </div>
            </div>
        ),
        { ...size }
    );
}
