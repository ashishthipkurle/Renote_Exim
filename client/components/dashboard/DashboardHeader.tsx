"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
  ChevronDown,
  HomeIcon,
  LogOut,
  LayoutDashboard,
  ListOrdered,
  Package,
  Heart,
  Settings
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTheme } from "next-themes";
import CartSheet from "@/components/cart/CartSheet";
import { toast } from "sonner";
import NotificationBell from "@/components/notifications/NotificationBell";
import LogoLight from "@/assests/LOGO_TEXT.png";
import LogoDark from "@/assests/Logo-2-without-circle.png";
import { getWishlist } from "@/lib/wishlist";

export default function DashboardHeader() {
  const { t } = useTranslation();
  const { open, toggleSidebar } = useSidebar();
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isMarketplace = pathname === "/products" || pathname.startsWith("/products/") || ["/cart", "/checkout", "/wishlist", "/orders", "/profile"].includes(pathname);
  const isProductDetails = pathname.startsWith("/products/") && pathname !== "/products";
  const isExporter = pathname.startsWith("/dashboard/exporter");
  const isImporter = pathname.startsWith("/dashboard/importer");

  const [wishlistCount, setWishlistCount] = useState(0);

  React.useEffect(() => {
    setMounted(true);
    
    const updateWishlist = () => {
      setWishlistCount(getWishlist().length);
    };
    updateWishlist();
    window.addEventListener("renote-wishlist-updated", updateWishlist);

    // Handle clicks outside dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("renote-wishlist-updated", updateWishlist);
    };
  }, []);

  const LogoImg = mounted && theme === "dark" ? LogoDark : LogoLight;

  return (
    <>
      <header className={`sticky top-0 z-40 border-b border-border/50 dark:border-white/10 bg-background/20 backdrop-blur-xl transition-all duration-300 w-full ${isMarketplace ? "h-20" : "h-14"}`}>
        <div className="flex h-full items-center px-4 md:px-6">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src={LogoImg}
                alt="Ranote Exim Logo"
                className={mounted && theme === "dark" ? "h-14 md:h-[75px] w-auto object-contain transition-all" : "h-8 md:h-10 w-auto object-contain transition-all"}
                unoptimized
              />
            </Link>

            {/* Sidebar Toggle */}
            {!isProductDetails && pathname !== "/cart" && pathname !== "/checkout" && pathname !== "/wishlist" && pathname !== "/orders" && pathname !== "/profile" && (
              <button
                onClick={toggleSidebar}
                className="h-10 w-10 ml-4 lg:ml-8 rounded-xl flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                title={open ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {open ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* SPACER */}
          <div className="flex-1" />

          {/* RIGHT SECTION: SEARCH + ACTIONS */}
          <div className="flex items-center gap-2 lg:gap-4">

            {/* SEARCH BAR (Pushed to Right) */}
            <div className="w-64 lg:w-80 relative group mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={t("search_placeholder", "Search shipments, assets...")}
                className="w-full bg-muted/50 border border-border/50 dark:border-white/5 focus:border-white/40 rounded-full pl-10 pr-4 py-2 text-sm text-foreground outline-none transition-all focus:bg-background shadow-inner"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher />
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="size-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* Orders — hidden for exporters and importers */}
              {!isExporter && !isImporter && (
                <Link
                  href="/orders"
                  className="size-9 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 group text-muted-foreground hover:text-primary"
                  title="Orders"
                >
                  <Package className="w-4 h-4" />
                </Link>
              )}

              {/* Wishlist — hidden for exporters */}
              {!isExporter && (
                <Link
                  href="/wishlist"
                  className="size-9 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 group text-muted-foreground hover:text-primary relative"
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4" />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground font-black text-[10px] flex items-center justify-center rounded-full animate-in zoom-in shadow-lg">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart — hidden for exporters */}
              {!isExporter && (
                <div className="size-9 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 group">
                  <CartSheet />
                </div>
              )}

              {/* Notifications */}
              <NotificationBell />
            </div>

            <div className="h-6 w-px bg-border dark:bg-white/10 mx-1 xs:block" />

            {/* PROFILE DROPDOWN OR SIGN IN */}
            {mounted && (
              <div className="relative" ref={dropdownRef}>
                {loading ? (
                  <div className="size-9 rounded-full bg-muted animate-pulse border border-border/50" />
                ) : user ? (
                  <>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="h-auto p-1 pr-2 gap-2 flex items-center rounded-full hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all active:scale-95 group"
                    >
                      <div className="size-8 rounded-full bg-black/10 dark:bg-white/10 ring-2 ring-black/10 dark:ring-white/10 group-hover:ring-black/30 dark:group-hover:ring-white/30 transition-all overflow-hidden flex items-center justify-center text-foreground dark:text-white font-bold text-xs">
                        {user.avatar ? (
                          <Image src={user.avatar as string} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          user.name?.[0] || <User className="w-4 h-4" />
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform ${isProfileOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 p-2 rounded-lg border border-border dark:border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 z-50">
                        <div className="p-3">
                          <p className="text-sm font-bold leading-none">{user.name || "User"}</p>
                          <p className="text-xs font-medium text-muted-foreground truncate mt-1">{user.email}</p>
                        </div>

                        <div className="h-px bg-border/50 dark:bg-white/5 my-1" />

                        <div className="p-1 space-y-1">
                          <Link href="/" className="flex items-center rounded-xl cursor-pointer py-2.5 px-3 hover:bg-secondary/80 transition-colors" onClick={() => setIsProfileOpen(false)}>
                            <HomeIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t("home", "Home")}</span>
                          </Link>
                          {user.role !== "USER" && (
                            <Link href="/dashboard" className="flex items-center rounded-xl cursor-pointer py-2.5 px-3 hover:bg-secondary/80 transition-colors" onClick={() => setIsProfileOpen(false)}>
                              <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{t("dashboard", "Dashboard")}</span>
                            </Link>
                          )}
                          <Link href="/profile" className="flex items-center rounded-xl cursor-pointer py-2.5 px-3 hover:bg-secondary/80 transition-colors" onClick={() => setIsProfileOpen(false)}>
                            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Profile & Settings</span>
                          </Link>
                        </div>

                        <div className="h-px bg-border/50 dark:bg-white/5 my-1" />

                        <div className="p-1">
                          <button
                            onClick={() => { setIsProfileOpen(false); logout(); }}
                            className="w-full flex items-center rounded-xl cursor-pointer py-2.5 px-3 text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            <span className="text-sm font-bold">{t("signout", "Log out")}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 rotate-180" />
                    <span>{t("signin", "Sign In")}</span>
                  </Link>
                )}
              </div>
            )}

          </div>
        </div>
      </header>
    </>
  );
}

