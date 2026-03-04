"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";

export default function AddToCartButton({
  productId,
  quantity = 1,
  className,
}: {
  productId: string;
  quantity?: number;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      addToCart(productId, quantity);
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className={className}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {loading ? "Adding..." : "Add to cart"}
    </Button>
  );
}
