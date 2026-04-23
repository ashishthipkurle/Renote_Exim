"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";

export default function BuyNowButton({
  productId,
  quantity = 1,
  className,
}: {
  productId: string;
  quantity?: number;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      // Logic: Add to cart first to ensure checkout has the item context
      addToCart(productId, quantity);
      
      // Redirect to checkout
      router.push("/checkout");
    } catch (err) {
      toast.error("Process failed. Please try again.");
      console.error("Buy Now Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className={className}
      disabled={loading}
      onClick={handleBuyNow}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="h-4 w-4 mr-2" />
      )}
      {loading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
