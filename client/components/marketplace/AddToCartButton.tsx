"use client";

import { ShoppingCart } from "lucide-react";
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
  return (
    <Button
      type="button"
      className={className}
      onClick={() => {
        addToCart(productId, quantity);
        toast.success("Added to cart");
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      Add to cart
    </Button>
  );
}
