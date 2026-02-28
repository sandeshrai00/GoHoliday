import { NextResponse } from 'next/server';
import { getDb } from '@/lib/turso';
import { bookings as bookingsSchema, tours as toursSchema } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/auth';
import { createRateLimiter } from '@/lib/rateLimit';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@goholidays.me';

// Initialize a rate limiter for bookings: 5 requests per 10 minutes per IP
const bookingRateLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 5,
    name: 'bookingsPOST',
    message: 'Too many booking attempts. Please try again later.'
});

// Valid booking status values
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

// Valid contact methods — whitelist to prevent injection
const VALID_CONTACT_METHODS = ['whatsapp', 'line', 'email', 'phone', 'wechat'];

// Helper to validate email format
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper for professional alphanumeric booking references (e.g. GH-A8F2K)
function generateRefCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `GH-${result}`;
}

// POST — public (customers submit bookings)
export async function POST(request) {
    try {
        const rateLimitResult = bookingRateLimiter(request);
        if (rateLimitResult.limited) {
            return NextResponse.json(
                { error: rateLimitResult.error },
                { status: rateLimitResult.status }
            );
        }

        const body = await request.json();
        const { tour_id, user_id, name, email, phone, contact_method, message } = body;

        // Validate required fields
        if (!tour_id || !name || !email || !phone || !contact_method) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate tour_id is a valid integer
        const safeTourId = parseInt(tour_id);
        if (isNaN(safeTourId) || safeTourId <= 0) {
            return NextResponse.json(
                { error: 'Invalid tour ID' },
                { status: 400 }
            );
        }

        // Validate contact_method against whitelist
        const safeContactMethod = String(contact_method).trim().toLowerCase();
        if (!VALID_CONTACT_METHODS.includes(safeContactMethod)) {
            return NextResponse.json(
                { error: `Invalid contact method. Must be one of: ${VALID_CONTACT_METHODS.join(', ')}` },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const safeName = String(name).trim().slice(0, 200);
        const safeEmail = String(email).trim().slice(0, 200);
        const safePhone = String(phone).trim().slice(0, 50);
        const safeMessage = message ? String(message).trim().slice(0, 2000) : '';

        const db = getDb();

        const tourResult = await db.select({
            price: toursSchema.price,
            is_discount_active: toursSchema.is_discount_active,
            discount_percentage: toursSchema.discount_percentage,
            title: toursSchema.title_en,
            baseTitle: toursSchema.title
        }).from(toursSchema).where(eq(toursSchema.id, safeTourId));

        if (!tourResult || tourResult.length === 0) {
            return NextResponse.json(
                { error: 'Tour not found' },
                { status: 404 }
            );
        }

        const dbTour = tourResult[0];

        // Calculate the true price per person
        const hasDiscount = dbTour.is_discount_active === 1 && dbTour.discount_percentage > 0;
        const pricePerAdult = hasDiscount ? dbTour.price * (1 - dbTour.discount_percentage / 100) : dbTour.price;
        const pricePerChild = pricePerAdult * 0.5;

        // Calculate authoritative total price
        const safeGuests = Math.max(1, Math.min(100, parseInt(body.guests) || 1));
        const safeChildren = Math.max(0, Math.min(100, parseInt(body.children) || 0));
        const trueTotalPrice = (safeGuests * pricePerAdult) + (safeChildren * pricePerChild);

        const refCode = generateRefCode();

        const [newBooking] = await db.insert(bookingsSchema).values({
            tour_id: safeTourId,
            user_id: user_id || null,
            reference_code: refCode,
            name: safeName,
            email: safeEmail,
            phone: safePhone,
            contact_method: safeContactMethod,
            message: safeMessage,
            guests: safeGuests,
            total_price: trueTotalPrice
        }).returning();

        // Send emails asynchronously
        if (resend) {
            try {
                let tourName = dbTour.title || dbTour.baseTitle || `Tour #${safeTourId}`;

                const customerHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Booking Request Received - GoHolidays</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3f4f6">
<tr>
<td align="center" style="padding:40px 20px;">

<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">

<tr>
<td align="center" style="padding:40px 20px 25px 20px;">
<img src="https://res.cloudinary.com/dl8ksbjyp/image/upload/v1772282746/logo_gyshkj.png"
width="170"
style="display:block;border:0;">
</td>
</tr>

<tr>
<td style="height:4px;background:linear-gradient(to right,#2563eb,#1e3a8a);"></td>
</tr>

<tr>
<td style="padding:40px 50px 20px 50px;">
<h2 style="margin:0 0 15px 0;color:#111827;font-size:22px;font-weight:600;">
Booking Request Received
</h2>

<p style="color:#4b5563;font-size:15px;line-height:1.7;">
Dear ${safeName},<br><br>
Thank you for submitting your booking request for <strong>${tourName}</strong> with GoHolidays.
</p>

<p style="color:#4b5563;font-size:15px;line-height:1.7;">
⚠️ <strong>This is not a confirmed booking yet.</strong><br>
Our travel team is currently reviewing your request. We will contact you via <strong>${safeContactMethod}</strong> shortly to confirm availability and finalize your itinerary.
</p>
</td>
</tr>

<tr>
<td style="padding:0 50px 30px 50px;">
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;">
<table width="100%">
<tr>
<td style="padding:6px 0;color:#64748b;font-size:14px;">Reference Code:</td>
<td style="padding:6px 0;text-align:right;font-weight:600;color:#111827;">${newBooking.reference_code}</td>
</tr>
<tr>
<td style="padding:6px 0;color:#64748b;font-size:14px;">Guests:</td>
<td style="padding:6px 0;text-align:right;font-weight:600;color:#111827;">${safeGuests} Adults${safeChildren > 0 ? `, ${safeChildren} Children` : ''}</td>
</tr>
<tr>
<td style="padding:6px 0;border-top:1px dashed #cbd5e1;color:#64748b;font-size:14px;">Estimated Total:</td>
<td style="padding:6px 0;border-top:1px dashed #cbd5e1;text-align:right;font-weight:700;color:#111827;">$${trueTotalPrice.toFixed(2)}</td>
</tr>
</table>
</div>
</td>
</tr>

<tr>
<td style="padding:0 50px 30px 50px;color:#6b7280;font-size:13px;line-height:1.6;">
If you have urgent questions, reply to this email or contact us at support@goholidays.me.
</td>
</tr>

<tr>
<td style="background:#f8fafc;text-align:center;padding:20px;font-size:12px;color:#9ca3af;">
© ${new Date().getFullYear()} GoHolidays. All rights reserved.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

                const adminHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>New Booking Request - GoHolidays</title>
</head>

<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f1f5f9">
<tr>
<td align="center" style="padding:30px 20px;">

<table width="650" cellpadding="0" cellspacing="0" style="max-width:650px;background:#ffffff;border-radius:10px;overflow:hidden;border-top:4px solid #2563eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

<tr>
<td style="padding:30px;">
<h2 style="margin:0 0 10px 0;color:#111827;font-size:22px;">
New Booking Request
</h2>
<p style="margin:0;color:#6b7280;font-size:14px;">
Reference: <strong>${newBooking.reference_code}</strong>
</p>
</td>
</tr>

<tr>
<td style="padding:0 30px 25px 30px;">
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:20px;">
<h3 style="margin:0 0 15px 0;font-size:14px;color:#374151;text-transform:uppercase;">
Customer Details
</h3>

<p style="margin:6px 0;"><strong>Name:</strong> ${safeName}</p>
<p style="margin:6px 0;"><strong>Email:</strong> ${safeEmail}</p>
<p style="margin:6px 0;"><strong>Phone:</strong> ${safePhone}</p>
<p style="margin:6px 0;"><strong>Preferred Contact:</strong> ${safeContactMethod}</p>
</div>

<div style="border:1px solid #e2e8f0;border-radius:8px;padding:20px;">
<h3 style="margin:0 0 15px 0;font-size:14px;color:#374151;text-transform:uppercase;">
Booking Details
</h3>

<p style="margin:6px 0;"><strong>Tour:</strong> ${tourName}</p>
<p style="margin:6px 0;"><strong>Guests:</strong> ${safeGuests} Adults${safeChildren > 0 ? `, ${safeChildren} Children` : ''}</p>
<p style="margin:6px 0;"><strong>Quoted Total:</strong> $${trueTotalPrice.toFixed(2)}</p>

<div style="margin-top:15px;padding-top:15px;border-top:1px solid #e2e8f0;">
<strong>Customer Notes:</strong>
<div style="background:#f8fafc;padding:12px;border-radius:6px;margin-top:8px;font-style:italic;">
${safeMessage || 'No additional notes provided.'}
</div>
</div>

</div>
</td>
</tr>

<tr>
<td style="padding:0 30px 30px 30px;">
<a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/bookings"
style="display:inline-block;background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
Open Admin Dashboard
</a>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

                // Parallel email sending
                await Promise.all([
                    resend.emails.send({
                        from: 'GoHolidays Bookings <bookings@mail.goholidays.me>',
                        to: [safeEmail],
                        subject: 'Your GoHolidays Booking Request Received',
                        html: customerHtml,
                    }).catch(e => console.error('Failed to send customer email:', e)),

                    resend.emails.send({
                        from: 'GoHolidays System <alerts@mail.goholidays.me>',
                        to: [adminEmail],
                        subject: `New Booking #${newBooking.id}: ${tourName} from ${safeName}`,
                        html: adminHtml,
                    }).catch(e => console.error('Failed to send admin email:', e))
                ]);

            } catch (emailError) {
                console.error('Email dispatch error:', emailError);
            }
        } else {
            console.warn('Resend API key missing. Skipping email notifications.');
        }

        return NextResponse.json(
            { success: true, message: 'Booking submitted successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Booking submission error:', error.message);
        return NextResponse.json(
            { error: 'Failed to submit booking' },
            { status: 500 }
        );
    }
}

// GET — admin only
export async function GET(request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDb();
        const result = await db.select().from(bookingsSchema).orderBy(desc(bookingsSchema.created_at));

        const bookings = result.map(row => JSON.parse(JSON.stringify(row)));

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// PUT — admin only
export async function PUT(request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, admin_note } = body;

        const safeId = parseInt(id, 10);
        if (Number.isNaN(safeId) || safeId < 1) {
            return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
        }

        if (!status && admin_note === undefined) {
            return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const db = getDb();
        const updates = {};

        if (status) updates.status = status;
        if (admin_note !== undefined) updates.admin_note = String(admin_note).trim().slice(0, 5000);

        await db.update(bookingsSchema).set(updates).where(eq(bookingsSchema.id, safeId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating booking:', error.message);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}
