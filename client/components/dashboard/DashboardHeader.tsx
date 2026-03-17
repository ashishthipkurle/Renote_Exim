"use client";

import React from "react";
import {
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    Package,
    User,
    Sun,
    Moon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/lib/contexts/SidebarContext";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "next-themes";
import CartSheet from "@/components/cart/CartSheet";

export default function DashboardHeader() {
    const { isExpanded, toggleSidebar } = useSidebar();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 lg:h-20 bg-white/90 dark:bg-[#0b1019]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-[100] flex items-center px-4 lg:px-8 transition-colors duration-300">
            {/* Logo Section */}
            <div className="flex items-center gap-4 w-60 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                    <Package className="text-white w-5 h-5" />
                </div>
                <div className="hidden md:block">
                    <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
                        RANOTE <span className="text-primary italic">EXIM</span>
                    </h1>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Global Trade Network</p>
                </div>
            </div>

            {/* Sidebar Toggle */}
            <button
                onClick={toggleSidebar}
                className="size-9 lg:size-10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 ml-2 lg:ml-0"
                title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Center Search Bar - Shifted slightly left to look more centered in the remaining layout */}
            <div className="flex-1 max-w-xl ml-8 lg:ml-20 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Global Intelligence, Shipments, or Assets..."
                        className="w-full bg-slate-100 dark:bg-[#151c2a]/60 border border-slate-200 dark:border-white/5 focus:border-primary/40 dark:focus:border-primary/40 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 outline-none transition-all shadow-inner font-medium italic"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4 ml-auto">
                {/* Theme Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="size-9 lg:size-10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                )}

                {/* Cart */}
                <CartSheet />

                {/* Notifications */}
                <Link
                    href="/dashboard/exporter/notifications"
                    className="relative size-9 lg:size-10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 group"
                >
                    <Bell className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-[#0b1019] shadow-[0_0_8px_rgba(19,91,236,0.6)]" />
                </Link>

                {/* Profile Circle */}
                <div className="h-4 lg:h-6 w-px bg-slate-200 dark:bg-white/5 mx-1 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{user?.name || "EXPORTER"}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 italic">Protocol verified</p>
                    </div>
                    <div className="size-9 lg:size-10 rounded-xl border-2 border-slate-200 dark:border-white/10 overflow-hidden cursor-pointer hover:border-primary dark:hover:border-primary transition-all p-0.5 bg-white dark:bg-slate-800 shadow-lg group">
                        {user?.avatar ? (
                            <Image
                                alt="User"
                                width={40} height={40}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                                src={user.avatar as string}
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <User className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
