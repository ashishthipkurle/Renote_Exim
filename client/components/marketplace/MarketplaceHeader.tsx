"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 LayoutDashboard,
 ListOrdered,
 PackageSearch,
 ShoppingCart,
 Globe2,
 User,
 LogOut,
 ChevronDown,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationBell from "@/components/notifications/NotificationBell";

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
 const { user, loading, logout } = useAuth();
 const dashboardPath = user?.role === "USER"
 ? "/products"
 : user?.role
 ? `/dashboard/${user.role.toLowerCase()}`
 : "/dashboard/importer";

 return (
 <header className="sticky top-0 z-40 w-full border-b border-border bg-background/70 backdrop-blur">
 <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
 <div className="flex items-center gap-4">
 <Link href="/" className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
 <Globe2 className="h-5 w-5" />
 </div>
 <span className="text-xl font-extrabold tracking-tight hidden md:inline">
 Ranote <span className="text-primary">Exim</span>
 </span>
 </Link>

 <nav className="hidden lg:flex items-center gap-2">
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


 <NotificationBell />
 <Link
 href="/cart"
 className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
 aria-label="Cart"
 >
 <ShoppingCart className="h-4 w-4" />
 </Link>

 {loading ? (
 <div className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
 ) : user ? (
 <div className="relative group">
 <button className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-foreground">
 <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary overflow-hidden">
 {user.avatar ? (
 <img src={user.avatar} alt={user.name || "User"} className="h-full w-full object-cover" />
 ) : (
 <User className="h-4 w-4" />
 )}
 </div>
 <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name || "Profile"}</span>
 <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
 </button>

 {/* Profile Dropdown Menu */}
 <div className="absolute right-0 top-full mt-2 w-48 origin-top-right transform opacity-0 scale-95 transition-all duration-200 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100">
 <div className="rounded-xl border border-border bg-card p-1 shadow-lg">
 <div className="px-2 py-2 border-b border-border/60 mb-1">
 <p className="text-sm font-medium">{user.name || "User"}</p>
 <p className="text-xs text-muted-foreground truncate">{user.email}</p>
 </div>
 <button
 type="button"
 onClick={async () => {
 await logout();
 window.location.href = "/login";
 }}
 className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
 >
 <LogOut className="h-4 w-4" />
 Logout
 </button>
 </div>
 </div>
 </div>
 ) : (
 <Link href="/login" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
 Sign In
 </Link>
 )}
 </div>
 </div>

 <div className="lg:hidden px-4 sm:px-6 pb-3 flex items-center gap-2">
 <NavLink href="/orders" label="Orders" icon={ListOrdered} />
 </div>
 </header>
 );
}
