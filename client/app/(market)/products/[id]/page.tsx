import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, StarHalf, CheckCircle2, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/marketplace/AddToCartButton";

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      exporter: {
        select: {
          name: true,
          companyName: true,
          country: true,
          website: true,
        },
      },
    },
  });

  if (!product) notFound();

  const heroImage = product.images?.[0] ?? null;
  const nameParts = product.name.split(" ").filter(Boolean);
  const splitIndex = Math.min(3, nameParts.length);
  const titlePrimary = nameParts.slice(0, splitIndex).join(" ");
  const titleAccent = nameParts.slice(splitIndex).join(" ");

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="opacity-60">/</span>
          <Link href="/products" className="hover:text-primary">
            Marketplace
          </Link>
          <span className="opacity-60">/</span>
          <span className="text-foreground font-semibold line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border relative group">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="px-3 py-1 bg-primary text-[10px] font-black uppercase tracking-widest rounded-full text-primary-foreground">
                  New Generation
                </span>
              </div>
            </div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(0, 4).map((src, idx) => (
                  <div
                    key={src}
                    className={
                      "aspect-square rounded-xl overflow-hidden bg-card border transition-colors " +
                      (idx === 0 ? "border-primary" : "border-border hover:border-border/70")
                    }
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className={
                          "object-cover transition-opacity " +
                          (idx === 0 ? "opacity-100" : "opacity-70 hover:opacity-100")
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <StarHalf className="h-4 w-4 fill-current" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">(128 Verified Reviews)</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                {titlePrimary}
                {titleAccent ? (
                  <>
                    {" "}
                    <span className="text-primary">{titleAccent}</span>
                  </>
                ) : null}
              </h1>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-6">
                SKU: {product.id.slice(0, 8).toUpperCase()} | {product.category}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description || "Premium listing engineered for high-throughput global trade workflows."}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 size-40 bg-primary/10 blur-[100px] group-hover:bg-primary/20 transition-all" />

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">Unit Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {formatMoney(product.price)}
                    </span>
                    <span className="text-muted-foreground text-sm">/ unit</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 text-sm font-black inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {product.available ? "In Stock" : "Unavailable"}
                  </span>
                  <p className="text-muted-foreground text-xs mt-1">Ready to ship within 24h</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-background/40 border border-border rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                    Min. Order (MOQ)
                  </p>
                  <p className="text-lg font-extrabold">
                    {product.minOrderQty} {product.unit}
                  </p>
                </div>
                <div className="bg-background/40 border border-border rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                    Origin
                  </p>
                  <p className="text-lg font-extrabold">{product.originCountry}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  Buy Now <ArrowRight className="h-4 w-4" />
                </Link>
                <AddToCartButton
                  productId={product.id}
                  className="w-full h-12 rounded-xl border border-border bg-background/40 text-foreground hover:bg-accent"
                />
              </div>

              <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-[0.2em] font-semibold">
                Bulk discounts applied at checkout
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-sm font-bold">Exporter</div>
              <div className="mt-2 text-sm">
                <div className="font-extrabold">
                  {product.exporter.companyName || product.exporter.name}
                </div>
                <div className="text-muted-foreground">
                  {product.exporter.country ?? product.originCountry}
                </div>
                {product.exporter.website && (
                  <a
                    href={product.exporter.website}
                    className="text-primary text-sm font-semibold hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit website
                  </a>
                )}
              </div>
            </div>

            {product.certifications?.length > 0 && (
              <div>
                <div className="text-sm font-bold">Certifications</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.certifications.slice(0, 8).map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
