// Simple in-memory rate limiter for Next.js API routes
// Works well for single-instance or basic spam deterrence inside Lambda lifecycles.

const rateLimitMaps = new Map();

export function createRateLimiter(options = {}) {
    const windowMs = options.windowMs || 60 * 1000; // default: 1 minute
    const max = options.max || 20; // default: 20 requests
    const name = options.name || 'global';
    const errorMessage = options.message || 'Too many requests. Please try again later.';

    if (!rateLimitMaps.has(name)) {
        rateLimitMaps.set(name, new Map());
    }
    const limits = rateLimitMaps.get(name);

    function cleanup() {
        const now = Date.now();
        for (const [ip, entry] of limits.entries()) {
            if (now - entry.windowStart > windowMs) {
                limits.delete(ip);
            }
        }
    }

    return function checkRateLimit(request) {
        cleanup();
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const now = Date.now();
        const entry = limits.get(ip);

        if (!entry || now - entry.windowStart > windowMs) {
            limits.set(ip, { windowStart: now, count: 1 });
            return { limited: false };
        }

        entry.count++;
        if (entry.count > max) {
            return { limited: true, error: errorMessage, status: 429 };
        }
        return { limited: false };
    }
}
