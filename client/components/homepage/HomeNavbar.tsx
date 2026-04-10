"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTranslation } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTheme } from "next-themes";
import { ShoppingBag } from "lucide-react";
import LogoLight from "@/assests/LOGO_TEXT.png";
import LogoDark from "@/assests/Logo-2-without-circle.png";

export default function HomeNavbar() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  const LogoImg = isDark ? LogoDark : LogoLight;

  return (
    <nav className="sticky top-0 w-full z-50 transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)"
      }}>
      <div className="relative w-full px-2 md:px-4 h-14 flex justify-between items-center">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image src={LogoImg} alt="Ranote Exim Logo" className={isDark ? "h-14 md:h-[75px] w-auto object-contain transition-all" : "h-8 md:h-10 w-auto object-contain transition-all"} unoptimized />
        </Link>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
        <Link
          className="flex items-center gap-2.5 px-8 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-foreground dark:text-white text-sm font-black uppercase tracking-[0.3em] transition-all duration-500 hover:scale-105 group"
          href="/products"
        >
          <ShoppingBag className="w-4 h-4 group-hover:rotate-12 transition-transform text-primary" />
          Marketplace
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user && (
          <Link
            href={user.role === "USER" ? "/products" : `/dashboard/${user.role.toLowerCase()}`}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <span className="material-icons text-sm">dashboard</span>
            {t("dashboard_btn", "Dashboard")}
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
        {loading ? (
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ) : user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full border-2 border-primary/40 flex items-center justify-center overflow-hidden hover:border-primary transition-colors focus:outline-none bg-slate-100 dark:bg-transparent"
            >
              {user.avatar ? (
                <Image src={user.avatar as string} alt="Profile" width={40} height={40} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="material-icons text-slate-600 dark:text-white text-lg">person</span>
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#101622]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 mb-2">
                  <p className="text-sm text-foreground font-bold truncate tracking-wide">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link
                  href={user.role === "USER" ? "/products" : `/dashboard/${user.role.toLowerCase()}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <span className="material-icons text-sm text-primary">dashboard</span>
                  {user.role === "USER" ? t("marketplace", "Marketplace") : t("dashboard", "Dashboard")}
                </Link>
                <Link
                  href={user.role === "USER" ? "/products" : `/dashboard/${user.role.toLowerCase()}/settings`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <span className="material-icons text-sm text-primary">settings</span>
                  {t("navbar.view_profile", "View Profile")}
                </Link>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 mt-1 border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-left"
                >
                  <span className="material-icons text-sm">logout</span>
                  {t("signout", "Sign Out")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className="hidden md:block text-sm font-medium text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary transition-colors" href="/login">
              {t("login", "Login")}
            </Link>
            <Link className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-6 rounded-lg primary-glow transition-all duration-300 transform hover:scale-105 primary-glow-hover" href="/register">
              {t("signup", "Get Started")}
            </Link>
          </>
        )}
        <button className="md:hidden text-slate-900 dark:text-white" type="button" aria-label="Menu">
          <span className="material-icons">menu</span>
        </button>
      </div>
  </div>
    </nav >
  );
}
