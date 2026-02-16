import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <MarketplaceHeader />
      <div className="w-full">{children}</div>
    </div>
  );
}
