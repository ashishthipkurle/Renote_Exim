"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomeNavbar() {
  const { user, loading, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold primary-glow-hover">
            <span className="material-icons text-sm">public</span>
          </div>
          <span className="text-xl font-bold tracking-wide text-foreground">
            RANOTE<span className="text-primary">EXIM</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link className="hover:text-primary dark:hover:text-white transition-colors" href="/products">
            Marketplace
          </Link>
        </div>

        <div className="flex items-center gap-4">
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
                    {user.role === "USER" ? "Marketplace" : "Dashboard"}
                  </Link>
                  <Link
                    href={user.role === "USER" ? "/products" : `/dashboard/${user.role.toLowerCase()}/settings`}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="material-icons text-sm text-primary">settings</span>
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 mt-1 border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-left"
                  >
                    <span className="material-icons text-sm">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="hidden md:block text-sm font-medium text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary transition-colors" href="/login">
                Login
              </Link>
              <Link className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-6 rounded-lg primary-glow transition-all duration-300 transform hover:scale-105 primary-glow-hover" href="/register">
                Get Started
              </Link>
            </>
          )}
          <button className="md:hidden text-slate-900 dark:text-white" type="button" aria-label="Menu">
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
