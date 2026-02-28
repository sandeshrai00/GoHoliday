import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/turso';
import { admins as adminsSchema } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Session secret MUST be set via environment variable — no fallback (security)
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET environment variable is required and must be at least 32 characters. Set it in .env and restart.');
}

export const sessionOptions = {
  password: sessionSecret,
  cookieName: 'goholiday_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return await getIronSession(cookieStore, sessionOptions);
}

export async function login(email, password) {
  const db = getDb();
  if (!db) {
    return { success: false, error: 'Database not configured' };
  }

  const result = await db.select().from(adminsSchema).where(eq(adminsSchema.email, email));

  if (result.length === 0) {
    return { success: false, error: 'Invalid credentials' };
  }

  const admin = result[0];
  const isValid = await bcrypt.compare(password, admin.password_hash);

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  const session = await getSession();
  session.userId = admin.id;
  session.email = admin.email;
  await session.save();

  return { success: true };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session.userId;
}
