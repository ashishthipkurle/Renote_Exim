"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  ListOrdered,
  PackageSearch,
  ShoppingCart,
  Globe2,
  Languages,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors " +
        (active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export default function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Globe2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight hidden md:inline">
              Renote <span className="text-primary">Exim</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            <NavLink href="/products" label="Marketplace" icon={PackageSearch} />
            <NavLink href="/cart" label="Cart" icon={ShoppingCart} />
            <NavLink href="/orders" label="Orders" icon={ListOrdered} />
          </nav>
        </div>

        <div className="flex-1 max-w-2xl hidden md:block px-4">
          <div className="relative group">
            <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              className="w-full rounded-xl border border-input bg-background/60 py-3 pl-11 pr-36 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60"
              placeholder="Search premium assets, raw materials, exporters..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="hidden lg:inline text-[10px] border border-border px-1.5 py-0.5 rounded text-muted-foreground font-black uppercase tracking-wider">
                Alt + K
              </span>
              <button
                type="button"
                className="hidden lg:inline-flex rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary hover:bg-primary/15"
              >
                AI Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              Market Status
            </span>
            <span className="text-xs text-emerald-500 flex items-center gap-2 font-black">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
              ACTIVE
            </span>
          </div>

          <div className="hidden lg:block h-8 w-px bg-border" />

          <button
            type="button"
            className="relative h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full" />
          </button>
          <button
            type="button"
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Language"
          >
            <Languages className="h-4 w-4" />
          </button>

          <ThemeToggle />
          <NavLink href="/dashboard/importer" label="Dashboard" icon={LayoutDashboard} />
        </div>
      </div>

      <div className="lg:hidden px-4 sm:px-6 pb-3 flex items-center gap-2">
        <NavLink href="/products" label="Marketplace" icon={PackageSearch} />
        <NavLink href="/cart" label="Cart" icon={ShoppingCart} />
        <NavLink href="/orders" label="Orders" icon={ListOrdered} />
      </div>
    </header>
  );
}
