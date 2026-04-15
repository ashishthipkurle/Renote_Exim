import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

export default function MarketplaceLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="h-dvh overflow-y-auto custom-scrollbar bg-background">
 <div className="w-full">{children}</div>
 </div>
 );
}
