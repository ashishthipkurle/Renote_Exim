import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporary pass-through middleware to prevent Next.js from throwing an error
// Re-enable the next-intl middleware when you are ready to implement i18n
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(en|es)/:path*']
// };
