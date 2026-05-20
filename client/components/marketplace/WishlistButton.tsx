"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export default function WishlistButton({ productId, className }: { productId: string, className?: string }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isInWishlist(productId));

    const handleUpdate = () => {
      setLiked(isInWishlist(productId));
    };

    window.addEventListener("renote-wishlist-updated", handleUpdate);
    return () => window.removeEventListener("renote-wishlist-updated", handleUpdate);
  }, [productId]);

  const handleToggle = () => {
    toggleWishlist(productId);
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
        liked ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" : "text-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
        className
      )}
      onClick={handleToggle}
    >
      <Heart className={cn("h-4 w-4 transition-all duration-300", liked ? "fill-current scale-110" : "scale-100")} />
      <span>{liked ? "Saved" : "Wishlist"}</span>
    </button>
  );
}
