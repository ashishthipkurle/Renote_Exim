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
    console.error("[Middleware] Token refresh error:", e.message);
    return null;
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

  // 3. Authentication & Route Guarding for Dashboard pages
  if (path.startsWith('/dashboard')) {
    const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    // Case 1: No tokens at all → redirect to login
    if (!accessToken && !refreshToken) {
      console.log("[Middleware] No auth cookies at all, redirecting to /login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Case 2: Access token exists → verify it. If expired, try to refresh.
    // Case 3: No access token but refresh token exists → refresh immediately.
    let needsRefresh = false;

    if (accessToken) {
      // Verify the access token offline
      const valid = isTokenValid(accessToken);
      if (!valid) {
        console.log("[Middleware] Access token expired locally, will attempt refresh.");
        needsRefresh = true;
      }
    } else {
      // No access token, but we have a refresh token
      needsRefresh = true;
    }

    if (needsRefresh) {
      if (!refreshToken) {
        console.log("[Middleware] No refresh token available, redirecting to /login");
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const newTokens = await refreshAccessToken(refreshToken);
      if (!newTokens) {
        console.log("[Middleware] Refresh failed, redirecting to /login");
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // SUCCESS: Forward the fresh access token as a request header so the
      // downstream server component can read it immediately.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-refreshed-access-token', newTokens.accessToken);

      // Create the outgoing response with the modified request headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Set the fresh tokens on the response cookies
      response.cookies.set(AUTH_COOKIE_NAME, newTokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      response.cookies.set(REFRESH_COOKIE_NAME, newTokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // Set language cookie if needed
      if (request.cookies.get(cookieName)?.value !== lng) {
        response.cookies.set(cookieName, lng, { path: '/' });
      }

      return response;
    }
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
