import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

 // Static routes
 const staticRoutes: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}`,
 lastModified: new Date(),
 changeFrequency: 'daily',
 priority: 1,
 },
 {
 url: `${baseUrl}/marketplace`,
 lastModified: new Date(),
 changeFrequency: 'hourly',
 priority: 0.9,
 },
 {
 url: `${baseUrl}/auth/login`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.5,
 },
 {
 url: `${baseUrl}/auth/register`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.5,
 },
 ];

 try {
 // Dynamic products
 const products = await prisma.product.findMany({
 where: { available: true, deletedAt: null },
 select: { id: true, updatedAt: true },
 take: 1000, 
 });

 const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
 url: `${baseUrl}/marketplace/product/${product.id}`,
 lastModified: product.updatedAt,
 changeFrequency: 'weekly',
 priority: 0.7,
 }));

 return [...staticRoutes, ...productRoutes];
 } catch (error) {
 console.error('Error generating sitemap:', error);
 return staticRoutes;
 }
}
