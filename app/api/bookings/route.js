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
        // Fetch the authoritative tour price and discount status from the DB
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
        const pricePerChild = pricePerAdult * 0.5; // Assuming 50% child discount based on BookingForm

        // Calculate authoritative total price
        const safeGuests = Math.max(1, Math.min(100, parseInt(body.guests) || 1));
        const safeChildren = Math.max(0, Math.min(100, parseInt(body.children) || 0));
        const trueTotalPrice = (safeGuests * pricePerAdult) + (safeChildren * pricePerChild);

        const refCode = generateRefCode(); // Create the new alphanumeric code

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

        // Send emails asynchronously (don't block the response, but catch errors)
        if (resend) {
            try {
                let tourName = dbTour.title || dbTour.baseTitle || `Tour #${safeTourId}`;

                const customerHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Booking Request Received</title>
                    </head>
                    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center">
                                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                        <tr>
                                            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
                                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">GoHolidays</h1>
                                                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Your Premium Travel Experience</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Booking Request Received</h2>
                                                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Dear ${safeName},</p>
                                                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for choosing GoHolidays. We have received your booking request for <strong>${tourName}</strong> and our team is currently processing it. We will contact you shortly via ${safeContactMethod} to confirm your itinerary and the final arrangements.</p>
                                                
                                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                                                    <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Request Summary</h3>
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Booking Reference:</td>
                                                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${newBooking.reference_code}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tour Requested:</td>
                                                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${tourName}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Number of Guests:</td>
                                                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${safeGuests}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 8px 0; border-top: 1px dashed #cbd5e1; margin-top: 8px; color: #64748b; font-size: 14px; font-weight: 600;">Estimated Total:</td>
                                                            <td style="padding: 8px 0; border-top: 1px dashed #cbd5e1; margin-top: 8px; color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">$${trueTotalPrice.toFixed(2)}</td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                
                                                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">If you have any immediate questions, simply reply to this email or contact our support team.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} GoHolidays. All rights reserved.</p>
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
                        <title>New Booking Alert</title>
                    </head>
                    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 0;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center">
                                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border-top: 4px solid #3b82f6; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                                        <tr>
                                            <td style="padding: 30px;">
                                                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                                                    <span style="background-color: #eff6ff; color: #3b82f6; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">New Lead</span>
                                                    <span style="color: #64748b; font-size: 13px; margin-left: 12px;">Ref: ${newBooking.reference_code}</span>
                                                </div>
                                                
                                                <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">Action Required: New Booking</h2>
                                                <p style="color: #475569; font-size: 15px; margin: 0 0 24px 0;">A new booking request has just been submitted via the website.</p>
                                                
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 24px;">
                                                    <tr>
                                                        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                                                            <h3 style="color: #0f172a; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</h3>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 16px;">
                                                            <div style="margin-bottom: 12px;"><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Name:</strong> <span style="color: #0f172a; font-size: 15px; margin-left: 8px;">${safeName}</span></div>
                                                            <div style="margin-bottom: 12px;"><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Email:</strong> <a href="mailto:${safeEmail}" style="color: #3b82f6; font-size: 15px; margin-left: 8px; text-decoration: none;">${safeEmail}</a></div>
                                                            <div style="margin-bottom: 12px;"><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Phone:</strong> <span style="color: #0f172a; font-size: 15px; margin-left: 8px;">${safePhone}</span></div>
                                                            <div><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Prefers:</strong> <span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">${safeContactMethod}</span></div>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 30px;">
                                                    <tr>
                                                        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                                                            <h3 style="color: #0f172a; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Booking Specifications</h3>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 16px;">
                                                            <div style="margin-bottom: 12px;"><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Tour ID:</strong> <span style="color: #0f172a; font-size: 15px; margin-left: 8px;">#${safeTourId}</span></div>
                                                            <div style="margin-bottom: 12px;"><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Party Size:</strong> <span style="color: #0f172a; font-size: 15px; margin-left: 8px;">${safeGuests} Adults${safeChildren > 0 ? `, ${safeChildren} Children` : ''}</span></div>
                                                            <div style="margin-bottom: 16px;"><strong style="color: #475569; font-size: 13px; text-transform: uppercase;">Total Quote:</strong> <span style="color: #0f172a; font-size: 15px; margin-left: 8px; font-weight: 600;">$${trueTotalPrice.toFixed(2)}</span></div>
                                                            
                                                            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                                                                <strong style="color: #475569; font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 8px;">Customer Notes:</strong>
                                                                <div style="background-color: #f8fafc; padding: 12px; border-radius: 4px; color: #334155; font-size: 14px; font-style: italic; white-space: pre-wrap;">${safeMessage || 'No additional notes provided.'}</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td align="center">
                                                            <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/bookings" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; text-align: center; width: 100%; box-sizing: border-box;">Open Admin Portal</a>
                                                        </td>
                                                    </tr>
                                                </table>
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
                // Do not throw; the booking was successfully saved.
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

// GET — admin only (returns customer PII)
export async function GET(request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = getDb();
        const result = await db.select().from(bookingsSchema).orderBy(desc(bookingsSchema.created_at));

        const bookings = result.map(row => JSON.parse(JSON.stringify(row)));

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

// PUT — admin only (update status/notes)
export async function PUT(request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, status, admin_note } = body;

        const safeId = parseInt(id, 10);
        if (Number.isNaN(safeId) || safeId < 1) {
            return NextResponse.json(
                { error: 'Invalid booking ID' },
                { status: 400 }
            );
        }

        if (!status && admin_note === undefined) {
            return NextResponse.json(
                { error: 'No update data provided (status or admin_note)' },
                { status: 400 }
            );
        }

        // Validate status against whitelist
        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        const db = getDb();
        const updates = {};

        if (status) {
            updates.status = status;
        }

        if (admin_note !== undefined) {
            updates.admin_note = String(admin_note).trim().slice(0, 5000);
        }

        await db.update(bookingsSchema).set(updates).where(eq(bookingsSchema.id, safeId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating booking:', error.message);
        return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
        );
    }
}
