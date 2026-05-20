const STORAGE_KEY = "ranote_wishlist_v1";

function readRaw(): unknown {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
