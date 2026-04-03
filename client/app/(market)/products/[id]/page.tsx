import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  Star,
  StarHalf,
  CheckCircle2,
  ArrowRight,
  FileText,
  Download,
  Zap,
  Thermometer,
  Cpu,
  HardDrive,
  Network,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/marketplace/AddToCartButton";
import { getServerAuth } from "@/lib/supabase/server";

type ProductReview = {
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        exporter: {
          select: {
            id: true,
            name: true,
            companyName: true,
            country: true,
            website: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Prisma fallback triggered for product detail:", error);
    try {
      const env = require("@/lib/supabase/shared").tryGetSupabaseEnv();
      if (env) {
        const { createClient } = require("@supabase/supabase-js");
        const supabase = createClient(env.url, env.anonKey);
        const { data: supaProduct, error: supaError } = await supabase
          .from('products')
          .select('*, exporter:users!exporterId(id, name, companyName, country, website)')
          .eq('id', id)
          .maybeSingle();

        if (!supaError && supaProduct) {
          product = {
            ...supaProduct,
            exporter: Array.isArray(supaProduct.exporter) ? supaProduct.exporter[0] : supaProduct.exporter
          } as any;
        } else {
          console.error("Supabase fallback failed:", supaError);
          product = null;
        }
      } else {
        product = null;
      }
    } catch (fallbackError) {
      console.error("Supabase fallback setup failed:", fallbackError);
      product = null;
    }
  }

  if (!product) notFound();

  const auth = await getServerAuth();
  const role = auth?.role || "USER";

  // Apply role-based price swap
  const originalProductPrice = product.price;
  product.price = role === "IMPORTER" ? product.price : (product.regularPrice || product.price);

  const heroImage = product.images?.[0] ?? null;
  const nameParts = product.name.split(" ").filter(Boolean);
  const splitIndex = Math.min(3, nameParts.length);
  const titlePrimary = nameParts.slice(0, splitIndex).join(" ");
  const titleAccent = nameParts.slice(splitIndex).join(" ");
  const oldPrice = originalProductPrice * 1.15;

  let productReviews: ProductReview[] = [];
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("renote_product_reviews")?.value;
    const parsed = raw ? (JSON.parse(decodeURIComponent(raw)) as ProductReview[]) : [];
    productReviews = parsed
      .filter((review) => review.productId === product.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    productReviews = [];
  }

  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      : 4.5;
  const fullStars = Math.floor(avgRating);
  const hasHalf = avgRating - fullStars >= 0.5;

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href="/products"
            className="hover:text-primary transition-colors"
          >
            Marketplace
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold line-clamp-1">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Hero Section ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted/30 border border-border relative group">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-lg">
                  No image available
                </div>
              )}
              <div className="absolute bottom-5 left-5">
                <span className="px-4 py-1.5 bg-primary text-[10px] font-black uppercase tracking-[0.15em] rounded-full text-primary-foreground shadow-lg">
                  New Generation
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((src: string, idx: number) => (
                  <div
                    key={src}
                    className={
                      "aspect-square rounded-xl overflow-hidden bg-muted/20 border-2 transition-all cursor-pointer " +
                      (idx === 0
                        ? "border-primary shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/40")
                    }
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className={
                          "object-cover transition-opacity " +
                          (idx === 0
                            ? "opacity-100"
                            : "opacity-60 hover:opacity-100")
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => {
                  if (star <= fullStars) return <Star key={star} className="h-4 w-4 fill-current" />;
                  if (star === fullStars + 1 && hasHalf) return <StarHalf key={star} className="h-4 w-4 fill-current" />;
                  return <Star key={star} className="h-4 w-4" />;
                })}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                ({productReviews.length > 0 ? productReviews.length : 128} Verified Reviews)
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-tight text-foreground">
              {titlePrimary}
              {titleAccent ? (
                <>
                  {" "}
                  <span className="text-primary">{titleAccent}</span>
                </>
              ) : null}
            </h1>

            {/* SKU */}
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em]">
              SKU: {product.id.slice(0, 8).toUpperCase()} |{" "}
              {product.category}
            </p>

            {/* Description */}
            <p className="text-base text-muted-foreground leading-relaxed">
              {product.description ||
                "Premium listing engineered for high-throughput global trade workflows."}
            </p>

            {/* ── Price Card ── */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-6">
              {/* Price + Stock */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-muted-foreground text-xs font-medium mb-1">
                    Unit Price
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {formatMoney(product.price)}
                    </span>
                    <span className="text-muted-foreground/50 text-sm line-through">
                      {formatMoney(oldPrice)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={
                      "text-sm font-bold inline-flex items-center gap-1 " +
                      (product.available
                        ? "text-emerald-500"
                        : "text-red-500")
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {product.available ? "In Stock" : "Out of Stock"}
                  </span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Ready to ship within 24h
                  </p>
                </div>
              </div>

              {/* MOQ + Origin */}
              <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden divide-x divide-border">
                <div className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                    Min. Order (MOQ)
                  </p>
                  <p className="text-lg font-extrabold text-foreground">
                    {product.minOrderQty} {product.unit}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                    Origin
                  </p>
                  <p className="text-lg font-extrabold text-foreground">
                    {product.originCountry}
                  </p>
                </div>
              </div>

              {/* Buy Now */}
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                Buy Now <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Add to Cart */}
              <AddToCartButton
                productId={product.id}
                className="w-full h-12 rounded-xl border border-border bg-background text-foreground hover:bg-accent font-medium"
              />

              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                Bulk discounts applied at checkout
              </p>
            </div>

            {/* Technical Specs Download */}
            <div className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Technical Specifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF Data Sheet (2.4 MB)
                  </p>
                </div>
              </div>
              <button className="text-primary text-sm font-bold hover:underline inline-flex items-center gap-1">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>

            {/* Exporter */}
            <div className="rounded-xl border border-border bg-card/60 p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Exporter
              </p>
              <p className="text-base font-extrabold text-foreground">
                {product.exporter.companyName || product.exporter.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {product.exporter.country ?? product.originCountry}
              </p>
              {product.exporter.website && (
                <a
                  href={product.exporter.website}
                  className="text-primary text-sm font-semibold hover:underline mt-1 inline-block"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit website →
                </a>
              )}
            </div>

            {/* Certifications */}
            {product.certifications?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.slice(0, 8).map((c: string) => (
                    <span
                      key={c}
                      className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Recent Buyer Reviews
              </p>

              {productReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No buyer review yet for this product. Order and share your experience.
                </p>
              ) : (
                <div className="space-y-3">
                  {productReviews.slice(0, 3).map((review) => (
                    <div key={review.orderId} className="rounded-lg border border-border bg-background/50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-current" : ""}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-2">{review.comment || "No written feedback."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Specifications Tabs ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
        <div className="flex gap-8 border-b border-border mb-8">
          <button className="pb-3 text-sm font-bold text-primary border-b-2 border-primary">
            Specifications
          </button>
          <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Performance Graphs
          </button>
          <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Documentation
          </button>
          <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Reviews
          </button>
        </div>

        {/* Specs Grid */}
        <div className="rounded-2xl border border-border bg-card/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary/60" /> Category
              </span>
              <span className="text-sm font-bold text-foreground">
                {product.category}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Thermometer className="h-4 w-4 text-primary/60" /> Origin
              </span>
              <span className="text-sm font-bold text-foreground">
                {product.originCountry}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cpu className="h-4 w-4 text-primary/60" /> Unit
              </span>
              <span className="text-sm font-bold text-foreground">
                {product.unit}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4 text-primary/60" /> MOQ
              </span>
              <span className="text-sm font-bold text-foreground">
                {product.minOrderQty} {product.unit}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Network className="h-4 w-4 text-primary/60" /> HS Code
              </span>
              <span className="text-sm font-bold text-foreground">
                {product.hsCode || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary/60" /> Stock
              </span>
              <span className="text-sm font-bold text-foreground">
                {product.quantity} {product.unit}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by Industry Leaders ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-6">
          Trusted by Industry Leaders
        </p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {[
            "TRADE-CORP",
            "GLOBAL-IND",
            "EXPORT-HUB",
            "PRIME-TRADE",
            "NEXUS-COM",
          ].map((brand) => (
            <span
              key={brand}
              className="text-sm font-black text-muted-foreground/40 uppercase tracking-[0.2em]"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ── Related Products ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Complete Your System
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Recommended compatible components and peripherals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              name: "Active Cooling Hub V2",
              price: "$129",
              desc: "Optimized for X1 Series Thermal Management",
            },
            {
              name: "Bridge Controller L1",
              price: "$450",
              desc: "Multi-protocol interface adapter for industrial hubs",
            },
            {
              name: "Pro-Mount Bracket Kit",
              price: "$89",
              desc: "Precision CNC aluminum mounting for 1U racks",
            },
            {
              name: "Ultra-Sync Fiber Link",
              price: "$215",
              desc: "Zero-latency data transmission for X1 cluster",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-muted/20 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-muted/30" />
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {item.name}
                  </p>
                  <span className="text-sm font-extrabold text-primary ml-2 whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                  {item.desc}
                </p>
                <button className="w-full py-2 rounded-lg border border-border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card/30 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-lg font-extrabold text-foreground mb-2">
                Ranote <span className="text-primary">Exim</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advancing global trade intelligence through premium solutions
                and enterprise-grade supply chain architecture.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Products
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">
                  Marketplace
                </li>
                <li className="hover:text-foreground cursor-pointer transition-colors">
                  Categories
                </li>
                <li className="hover:text-foreground cursor-pointer transition-colors">
                  Exporters
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Enterprise
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">
                  Supply Chain
                </li>
                <li className="hover:text-foreground cursor-pointer transition-colors">
                  Bulk Purchasing
                </li>
                <li className="hover:text-foreground cursor-pointer transition-colors">
                  Consultancy
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Newsletter
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Get the latest product updates.
              </p>
              <div className="flex">
                <input
                  className="flex-1 rounded-l-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary/50"
                  placeholder="Email address"
                />
                <button className="rounded-r-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 Ranote Exim. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Terms of Service
              </span>
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Compliance
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
