"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Truck, MapPin, Search } from "lucide-react";
import Link from 'next/link';

const SHIPMENT_STATUS: Record<string, { label: string; color: string }> = {
    PREPARING: { label: "Preparing", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
    IN_TRANSIT: { label: "In Transit", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
    CUSTOMS: { label: "Customs", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    RETURNED: { label: "Returned", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

function formatDate(d: Date | string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default function ShipmentsTable({ shipments }: { shipments: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchQuery) params.set("search", searchQuery);
        else params.delete("search");
        params.delete("page");

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by tracking number, buyer, or product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                </form>
            </div>

            <div className="space-y-4 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                {shipments.length === 0 ? (
                    <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-16 text-center">
                        <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-foreground mb-3 uppercase italic">No Global Logistics ID&apos;d</h2>
                        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto leading-relaxed">
                            There are currently no active shipments in transit. Your logistics chain will appear here once orders are dispatched.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                            <div className="col-span-3 text-primary opacity-50">Logistics ID / Asset</div>
                            <div className="col-span-2">Recipient Entity</div>
                            <div className="col-span-2">Carrier Network</div>
                            <div className="col-span-2">Transmission Status</div>
                            <div className="col-span-1">Arrival Est.</div>
                            <div className="col-span-2 text-right">Initialized</div>
                        </div>

                        {shipments.map((shipment) => {
                            const cfg = SHIPMENT_STATUS[shipment.status] ?? SHIPMENT_STATUS.PREPARING;
                            return (
                                <Link
                                    key={shipment.id}
                                    href={`/dashboard/exporter/shipments/${shipment.id}`}
                                    className="bg-card border border-border hover:border-primary/40 transition-all duration-500 shadow-2xl rounded-[2rem] p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center group hover:scale-[1.01] block"
                                >
                                    <div className="lg:col-span-3">
                                        <div className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                                            {shipment.trackingNumber}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1 font-medium italic group-hover:text-muted-foreground/80">
                                            {shipment.order.items?.[0]?.product?.name || "Order Item"}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="text-sm font-bold text-foreground/90 truncate">
                                            {shipment.order.importer.companyName || shipment.order.importer.name}
                                        </div>
                                        <div className="text-[9px] text-muted-foreground flex items-center gap-1 font-black uppercase tracking-wider mt-1">
                                            <MapPin className="w-3 h-3 text-primary" />
                                            {shipment.order.importer.country ?? "INTERNATIONAL ZONE"}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted border border-border px-3 py-1.5 rounded-xl w-fit">
                                            {shipment.carrier || "UNDISCLOSED"}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${cfg.color}`}>
                                            <span className="size-1.5 rounded-full bg-current animate-pulse" />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="lg:col-span-1">
                                        <div className="text-sm font-black text-foreground/90">
                                            {shipment.estimatedArrival
                                                ? formatDate(shipment.estimatedArrival)
                                                : "CALCULATING"}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 text-right">
                                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">{formatDate(shipment.createdAt)}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
