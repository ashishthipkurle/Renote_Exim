import { createClient } from "./supabase/client";

export type CartItem = {
  productId: string;
  quantity: number;
};

const BASE_KEY = "ranote_cart_v1";

/** Get the user-scoped storage key. Falls back to a guest key. */
function getStorageKey(): string {
  if (typeof window === "undefined") return BASE_KEY;
  // Check for a cached user profile to scope the key per user
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

export function getCart(): CartItem[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) return [];

  const parseItem = (value: unknown): CartItem | null => {
    if (!value || typeof value !== "object") return null;
    const obj = value as Record<string, unknown>;
    const productId = obj.productId;
    const quantity = obj.quantity;
    if (typeof productId !== "string") return null;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) return null;
    return {
      productId,
      quantity: Math.max(1, Math.floor(quantity)),
    };
  };

  return raw
    .map(parseItem)
    .filter((x): x is CartItem => x !== null);
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(), JSON.stringify(items));
  window.dispatchEvent(new Event("renote-cart-updated"));
}

export function addToCart(productId: string, quantity = 1) {
  const items = getCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity = Math.max(1, existing.quantity + Math.max(1, Math.floor(quantity)));
  } else {
    items.push({ productId, quantity: Math.max(1, Math.floor(quantity)) });
  }
  setCart(items);
}

export function updateQuantity(productId: string, quantity: number) {
  const items = getCart();
  const next = items
    .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.floor(quantity)) } : i))
    .filter((i) => i.quantity > 0);
  setCart(next);
}

export function removeFromCart(productId: string) {
  const items = getCart();
  setCart(items.filter((i) => i.productId !== productId));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getStorageKey());
  window.dispatchEvent(new Event("renote-cart-updated"));
}

/**
 * Clears all cart data for ALL users from localStorage.
 * Used during logout to ensure no stale data leaks between accounts.
 */
export function clearAllCartData() {
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
  window.localStorage.removeItem("ranote_cart_v1");
  window.dispatchEvent(new Event("renote-cart-updated"));
}
