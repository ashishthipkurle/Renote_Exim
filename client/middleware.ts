import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  authRateLimit, 
  orderRateLimit, 
  documentRateLimit, 
  searchRateLimit, 
  defaultRateLimit 
} from '@/lib/redis';

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Rate Limiting Logic for V3 Specifications
  try {
    let limitResult;

    if (path.startsWith('/api/auth')) {
      limitResult = await authRateLimit.limit(ip);
    } else if (path.startsWith('/api/orders')) {
      limitResult = await orderRateLimit.limit(ip);
    } else if (path.startsWith('/api/documents')) {
      limitResult = await documentRateLimit.limit(ip);
    } else if (path.startsWith('/api/search/products')) {
      limitResult = await searchRateLimit.limit(ip);
    } else if (path.startsWith('/api/')) {
      limitResult = await defaultRateLimit.limit(ip);
    }

    if (limitResult && !limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': limitResult.reset.toString(),
            'X-RateLimit-Limit': limitResult.limit.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString()
          } 
        }
      );
    }
  } catch (err) {
    console.error('Rate limit error:', err);
    // Fail open if Redis is down
  }

  // Future expansion: Nhost SSR JWT decoding for strict role routing
  const hasAuthToken = request.cookies.getAll().some(c => c.name.includes('nhost') || c.name.includes('sb_access_token') || c.name.includes('token'));
  
  if (path.startsWith('/dashboard/') && !hasAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
