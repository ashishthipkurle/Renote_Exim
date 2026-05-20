export type CartItem = {
  productId: string;
  quantity: number;
};

const STORAGE_KEY = "ranote_cart_v1";

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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("renote-cart-updated"));
}
