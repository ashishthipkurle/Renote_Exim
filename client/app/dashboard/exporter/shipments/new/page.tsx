"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderOption = {
  id: string;
  orderNumber: string;
  product: { name: string; category: string };
  buyer: { name: string; businessName?: string; country?: string };
  quantity: number;
  totalPrice: number;
  notes?: string;
};

export default function NewShipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId") || "";
  
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId);
  const [carrier, setCarrier] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  // Fetch orders without shipments
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders?noShipment=true", {
          withCredentials: true,
        });
        const allOrders = res.data?.orders || [];
        // Filter to orders that don't have shipments
        const eligible = allOrders.filter((o: any) => !o.shipment);
        setOrders(eligible);
      } catch {
        // Fallback: try fetching from the exporter orders page data
        try {
          const res = await axios.get("/api/orders", { withCredentials: true });
          const allOrders = res.data?.orders || [];
          const eligible = allOrders.filter((o: any) => !o.shipment);
          setOrders(eligible);
        } catch {
          toast.error("Failed to load orders");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Auto-fill destination from selected order's notes (shipping address)
  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find((o) => o.id === selectedOrderId);
      if (order?.notes) {
        const shipTo = order.notes.replace(/^Ship to:\s*/i, "").split(" | Phone:")[0];
        if (shipTo) setDestination(shipTo);
      }
    }
  }, [selectedOrderId, orders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !carrier || !origin || !destination || !estimatedDelivery) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        "/api/shipments",
        {
          orderId: selectedOrderId,
          carrier,
          origin,
          destination,
          estimatedDelivery: new Date(estimatedDelivery).toISOString(),
        },
        { withCredentials: true }
      );
      toast.success("Shipment created successfully!");
      router.push("/dashboard/exporter/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create shipment");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/exporter/orders"
            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Shipment</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Set up shipping for an order
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">No Orders Available</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All your orders already have shipments, or you have no orders yet.
            </p>
            <Link
              href="/dashboard/exporter/orders"
              className="inline-flex mt-4 items-center gap-2 text-sm text-primary hover:underline"
            >
              Back to Orders
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Order */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4" /> Select Order
              </h2>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              >
                <option value="">Choose an order...</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} — {order.product?.name} ({order.quantity} units)
                  </option>
                ))}
              </select>

              {selectedOrder && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Product</p>
                      <p className="font-medium">{selectedOrder.product?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Buyer</p>
                      <p className="font-medium">
                        {selectedOrder.buyer?.businessName || selectedOrder.buyer?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-medium">{selectedOrder.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Buyer Country</p>
                      <p className="font-medium">{selectedOrder.buyer?.country || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Details */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4" /> Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Carrier / Courier *
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g., DHL, FedEx, Maersk"
                    className="mt-1.5 w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Estimated Delivery *
                  </label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Origin (Ship From) *
                  </label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g., Mumbai, India"
                      className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Destination (Ship To) *
                  </label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., New York, USA"
                      className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || !selectedOrderId}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Shipment...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" /> Create Shipment
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
