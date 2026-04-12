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

/**
 * Gets the current authenticated user context on the server side.
 * This matches the legacy getApiAuthContext signature from lib/supabase/auth.ts
 * to make refactoring easier.
 */
export async function getApiAuthContext(
  request: NextRequest,
  allowedRoles?: Role[]
): Promise<{ auth: AuthContext | null; error: NextResponse | null }> {
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
      console.log("[Auth] No access token found in request");
      return {
        auth: null,
        error: NextResponse.json({ error: "Missing authentication token" }, { status: 401 }),
      };
    }

    // 2. Verify with Nhost via direct API call (most robust way in Server context)
    const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
    const region = process.env.NEXT_PUBLIC_NHOST_REGION;
    const verifyUrl = `https://${subdomain}.auth.${region}.nhost.run/v1/user`;

    const verifyRes = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!verifyRes.ok) {
      console.warn("[Auth] Token verification API failed with status:", verifyRes.status);
      
      // 2b. If invalid/expired, try to refresh using the refresh token
      const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
      if (refreshToken) {
        console.log("[Auth] Attempting token refresh...");
        const refreshRes = await fetch(`https://${subdomain}.auth.${region}.nhost.run/v1/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.accessToken;
          const newRefreshToken = refreshData.refreshToken;

          if (newAccessToken) {
            console.log("[Auth] Token refreshed successfully");
            // Set the new tokens in cookies for the next request
            try {
              cookieStore.set(AUTH_COOKIE_NAME, newAccessToken, AUTH_COOKIE_OPTIONS);
              if (newRefreshToken) {
                cookieStore.set(REFRESH_COOKIE_NAME, newRefreshToken, {
                  ...AUTH_COOKIE_OPTIONS,
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                });
              }
            } catch (cookieErr) {
              console.warn("[Auth] Failed to set new cookies in getApiAuthContext:", cookieErr);
            }

            // Return user data from the refresh response
            const userData = refreshData.user;
            if (userData?.id) {
               return await getContextForUser(userData.id, allowedRoles);
            } else {
               console.warn("[Auth] Refresh successful but no user.id in response.");
            }
          } else {
            console.warn("[Auth] Refresh API succeeded but returned no new access token.");
          }
        } else {
          console.warn("[Auth] Refresh API failed with status:", refreshRes.status);
          try {
            const errBody = await refreshRes.json();
            console.warn("[Auth] Refresh API error:", errBody);
          } catch {}
        }
      } else {
        console.warn("[Auth] No refresh token found in cookies.");
      }

      console.warn("[Auth] Returning 401 'Invalid or expired token'.");
      return {
        auth: null,
        error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
      };
    }

    const nhostUser = await verifyRes.json();
    const userId = nhostUser.id;

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
