import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  authRateLimit,
  orderRateLimit,
  documentRateLimit,
  searchRateLimit,
  defaultRateLimit
} from '@/lib/redis';

import { fallbackLng, languages, cookieName } from './lib/i18n/config';

// Cookie constants (duplicated here since middleware can't import from lib/auth-server in edge runtime)
const AUTH_COOKIE_NAME = "sb_access_token";
const REFRESH_COOKIE_NAME = "sb_refresh_token";
const NHOST_SUBDOMAIN = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "ischyvihgnfuncrkopph";
const NHOST_REGION = process.env.NEXT_PUBLIC_NHOST_REGION || "ap-south-1";

/**
 * Attempts to refresh the Nhost access token using the refresh token.
 * Returns the new tokens if successful, null otherwise.
 */
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://${NHOST_SUBDOMAIN}.auth.${NHOST_REGION}.nhost.run/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.log("[Middleware] Token refresh failed, status:", res.status);
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.accessToken || data.session?.accessToken;
    const newRefreshToken = data.refreshToken || data.session?.refreshToken;

    if (newAccessToken) {
      console.log("[Middleware] Token refreshed successfully.");
      return { accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken };
    }

    return null;
  } catch (e: any) {
    console.error("[Middleware] Token refresh error (likely network/timeout):", e.message);
    return "NETWORK_ERROR" as any;
  }
}

/**
 * Verifies if the access token is still valid by checking its JWT expiration claim offline.
 * This avoids hitting Nhost API on every single page load which causes extreme latency and random 429 timeouts.
 */
function isTokenValid(accessToken: string): boolean {
  try {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Using Buffer since atob might not be reliable in all Edge environments, but atob is generally fine.
    // However, for NextJS middleware, atob is available.
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    if (!payload || !payload.exp) return false;

    // Add a 30-second buffer. If it expires in less than 30s, treat it as expired to proactively refresh.
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > (currentTime + 30);
  } catch (e) {
    console.error("[Middleware] JWT Parse error:", e);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // 1. i18n Language Detection (Safe)
  let lng = request.cookies.get(cookieName)?.value;
  if (!lng) {
    // Detect from accept-language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      lng = languages.find(l => acceptLanguage.includes(l));
    }
  }
  if (!lng) lng = fallbackLng;

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

  // 3. Global Token Refresh — applies to ALL routes with auth cookies.
  //    This ensures /api/auth/me and other API routes also get fresh tokens,
  //    preventing 122-second hangs when expired JWTs hit the Nhost API directly.
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (accessToken || refreshToken) {
    let needsRefresh = false;

    if (accessToken) {
      if (!isTokenValid(accessToken)) {
        console.log("[Middleware] Access token expired, will attempt refresh.");
        needsRefresh = true;
      }
    } else {
      needsRefresh = true;
    }

    if (needsRefresh) {
      if (!refreshToken) {
        // No refresh token — only block dashboard access
        if (path.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } else {
        const newTokens = await refreshAccessToken(refreshToken);
        if (newTokens === "NETWORK_ERROR" as any) {
          console.log("[Middleware] Network error during token refresh. Bypassing strict logout.");
          return NextResponse.next();
        } else if (newTokens) {
          // SUCCESS: Forward fresh token to downstream server code
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-refreshed-access-token', newTokens.accessToken);

          const response = NextResponse.next({
            request: { headers: requestHeaders },
          });

          response.cookies.set(AUTH_COOKIE_NAME, newTokens.accessToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: 60 * 60 * 24 * 7,
          });

          response.cookies.set(REFRESH_COOKIE_NAME, newTokens.refreshToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: 60 * 60 * 24 * 30,
          });

          if (request.cookies.get(cookieName)?.value !== lng) {
            response.cookies.set(cookieName, lng, { path: '/' });
          }

          return response;
        } else {
          // Refresh failed — only block dashboard access
          if (path.startsWith('/dashboard')) {
            console.log("[Middleware] Refresh failed, redirecting to /login");
            return NextResponse.redirect(new URL('/login', request.url));
          }
        }
      }
    }
  } else if (path.startsWith('/dashboard')) {
    // No tokens at all trying to access dashboard
    console.log("[Middleware] No auth cookies, redirecting to /login");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();
  // Set language cookie if not present or different
  if (request.cookies.get(cookieName)?.value !== lng) {
    response.cookies.set(cookieName, lng, { path: '/' });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};
