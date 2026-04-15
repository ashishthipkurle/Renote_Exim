import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

 return {
 rules: {
 userAgent: '*',
 allow: '/',
 disallow: [
 '/dashboard/', /* Protect user dashboards */
 '/auth/callback', /* Protect auth mechanisms */
 '/api/', /* Protect backend APIs */
 ],
 },
 sitemap: `${baseUrl}/sitemap.xml`,
 };
}
