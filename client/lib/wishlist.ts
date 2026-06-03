const BASE_KEY = "ranote_wishlist_v1";

/** Get the user-scoped storage key. Falls back to a guest key. */
function getStorageKey(): string {
  if (typeof window === "undefined") return BASE_KEY;
  try {
    const cached = window.localStorage.getItem("user_profile");
    if (cached) {
      const user = JSON.parse(cached);
      if (user?.id) return `${BASE_KEY}_${user.id}`;
    }
  } catch {}
  return `${BASE_KEY}_guest`;
}

function readRaw(): unknown {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(getStorageKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getWishlist(): string[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export function setWishlist(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(), JSON.stringify(items));
  window.dispatchEvent(new Event("renote-wishlist-updated"));
}

export function toggleWishlist(productId: string) {
  const items = getWishlist();
  if (items.includes(productId)) {
    setWishlist(items.filter((id) => id !== productId));
  } else {
    items.push(productId);
    setWishlist(items);
  }
}

export function isInWishlist(productId: string): boolean {
  if (typeof window === "undefined") return false;
  return getWishlist().includes(productId);
}

/**
 * Clears all wishlist data for ALL users from localStorage.
 * Used during logout to ensure no stale data leaks between accounts.
 */
export function clearAllWishlistData() {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(BASE_KEY)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  // Also remove the old un-scoped key from before this fix
  window.localStorage.removeItem("ranote_wishlist_v1");
  window.dispatchEvent(new Event("renote-wishlist-updated"));
}
