export const AUTH_COOKIE_NAME = "sb_access_token";

export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: false, // Set to false so Client Components can detect session
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 1 week
};
