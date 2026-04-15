import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nhost } from "./nhost";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export type AuthContext = {
  userId: string;
  role: Role;
  email: string;
  user: any;
};

export const AUTH_COOKIE_NAME = "sb_access_token";
export const REFRESH_COOKIE_NAME = "sb_refresh_token";

export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

export const REFRESH_COOKIE_OPTIONS = {
  ...AUTH_COOKIE_OPTIONS,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/**
 * Helper to perform a fetch with a timeout to prevent hanging the server
 */
async function fetchWithTimeout(url: string, options: any, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Gets the current authenticated user context on the server side.
 * This matches the legacy getApiAuthContext signature from lib/supabase/auth.ts
 * to make refactoring easier.
 */
export async function getApiAuthContext(
  request: NextRequest,
  allowedRoles?: Role[]
): Promise<{ auth: AuthContext | null; error: NextResponse | null; newAccessToken?: string; newRefreshToken?: string }> {
  try {
    // 1. Get token from cookies or Authorization header
    const cookieStore = cookies();
    let accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!accessToken && request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7);
      }
    }

    if (!accessToken) {
      console.log("[Auth Server] No access token found in cookies.");
      return {
        auth: null,
        error: NextResponse.json({ error: "Missing authentication token" }, { status: 401 }),
      };
    }

    // 2. Verify with Nhost via direct API call (most robust way in Server context)
    const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
    const region = process.env.NEXT_PUBLIC_NHOST_REGION;
    const verifyUrl = `https://${subdomain}.auth.${region}.nhost.run/v1/user`;

    console.log("[Auth Server] Verifying token via Nhost API...");
    let verifyRes;
    try {
      verifyRes = await fetchWithTimeout(verifyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }, 5000); // 5s timeout
    } catch (e: any) {
      console.error("[Auth Server] Verification call failed or timed out:", e.message);
      return {
        auth: null,
        error: NextResponse.json({ error: "Auth verification timeout" }, { status: 401 }),
      };
    }

    if (!verifyRes.ok) {
      console.warn("[Auth Server] Token invalid (Status:", verifyRes.status, "). Attempting refresh...");
      
      // 2b. If invalid/expired, try to refresh using the refresh token
      const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
      if (refreshToken) {
        let refreshRes;
        try {
          refreshRes = await fetchWithTimeout(`https://${subdomain}.auth.${region}.nhost.run/v1/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
            cache: "no-store",
          }, 5000); // 5s timeout
        } catch (e: any) {
          console.error("[Auth Server] Refresh call timed out:", e.message);
          return { auth: null, error: null }; // Silent fail to let client take over
        }

        if (refreshRes && refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.accessToken || refreshData.session?.accessToken || refreshData.jwt_token;
          const newRefreshToken = refreshData.refreshToken || refreshData.session?.refreshToken;

          if (newAccessToken) {
            console.log("[Auth Server] Token refreshed successfully.");
            
            // Return user data from the refresh response
            const userData = refreshData.user || refreshData.session?.user;
            if (userData?.id) {
               const context = await getContextForUser(userData.id, allowedRoles);
               if (context.auth) {
                 return {
                   ...context,
                   newAccessToken,
                   newRefreshToken,
                 };
               }
            }
          }
        } else {
          console.warn("[Auth Server] Refresh failed (Status:", refreshRes?.status, ")");
        }
      }

      return {
        auth: null,
        error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
      };
    }

    const nhostUser = await verifyRes.json();
    const userId = nhostUser.id || nhostUser.user?.id;

    if (!userId) {
      console.warn("[Auth] No user ID in Nhost response");
      return {
        auth: null,
        error: NextResponse.json({ error: "Invalid session data" }, { status: 401 }),
      };
    }

    console.log("[Auth] Verified Nhost User:", userId, nhostUser.email);

    // 3. Fetch full profile from Prisma to get the Role and other metadata
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        b2bActive: true,
        b2cActive: true,
      }
    });

    if (!dbUser) {
      console.warn("[Auth] User in Nhost but missing in Prisma:", userId);
      return {
        auth: null,
        error: NextResponse.json({ error: "User profile not found in database" }, { status: 401 }),
      };
    }

    // 4. Role-based access control check
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(dbUser.role)) {
        console.warn("[Auth] Role mismatch. Required:", allowedRoles, "Has:", dbUser.role);
        return {
          auth: null,
          error: NextResponse.json(
            { error: "Forbidden: You do not have the required permissions" },
            { status: 403 }
          ),
        };
      }
    }

    return {
      auth: {
        userId: dbUser.id,
        role: dbUser.role,
        email: dbUser.email,
        user: dbUser,
      },
      error: null,
    };
  } catch (e) {
    console.error("[Auth] Fatal error in getApiAuthContext:", e);
    return {
      auth: null,
      error: NextResponse.json({ error: "Internal server error during authentication" }, { status: 500 }),
    };
  }
}

/**
 * Internal helper to fetch user from DB and verify roles
 */
async function getContextForUser(userId: string, allowedRoles?: Role[]): Promise<{ auth: AuthContext | null; error: NextResponse | null }> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    return {
      auth: null,
      error: NextResponse.json({ error: "User profile not found in database" }, { status: 401 }),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(dbUser.role)) {
    return {
      auth: null,
      error: NextResponse.json(
        { error: "Forbidden: You do not have the required permissions" },
        { status: 403 }
      ),
    };
  }

  return {
    auth: {
      userId: dbUser.id,
      role: dbUser.role,
      email: dbUser.email,
      user: dbUser,
    },
    error: null,
  };
}

/**
 * Shorthand for simple getServerAuthContext (legacy support)
 */
export async function getServerAuthContext(req?: NextRequest): Promise<AuthContext | null> {
  const { auth } = await getApiAuthContext(req as NextRequest);
  return auth;
}

/**
 * Sets the Nhost access token in a secure server-side cookie.
 */
export function setServerAuthCookie(accessToken: string) {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTIONS);
}

/**
 * Clears the auth cookies
 */
export function clearServerAuthCookie() {
    const cookieStore = cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    cookieStore.delete('nhost-session'); // Clear old ones too
}
