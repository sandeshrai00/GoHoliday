export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
