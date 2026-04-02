"use client";

import React, { useState, useEffect } from "react";
import { 
    Search, 
    Globe, 
    ShieldCheck, 
    ShieldAlert, 
    Clock,
    Terminal
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { format } from "date-fns";
import { toast } from "sonner";
import clsx from "clsx";
import EmptyState from "@/components/ui/EmptyState";

type LogEntry = {
    id: string;
    userId: string;
    ip: string;
    userAgent: string;
    success: boolean;
    createdAt: string;
    user: {
        name: string;
        email: string;
        role: string;
    };
};

export default function AdminLogsPage() {
    const authFetch = useAuthFetch();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await authFetch<LogEntry[]>("/api/admin/logs");
            setLogs(data || []);
        } catch (error) {
            toast.error("Failed to fetch activity logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.user.name.toLowerCase().includes(search.toLowerCase()) ||
        log.user.email.toLowerCase().includes(search.toLowerCase()) ||
        log.ip?.includes(search)
    );

    return (
        <div className="h-dvh flex flex-col bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

            <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                        System Audit Logs
                        <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded">
                            LIVE FEED
                        </span>
                    </h1>
                    <p className="text-slate-500 text-xs font-medium italic">Monitoring platform volatility and entity transmissions.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search IP, Entity, Email..."
                            className="bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none w-64 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="bg-muted/40 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Stamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entity Source</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Origin (IP)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">System Context</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20">
                                        <EmptyState 
                                            iconName="searchX"
                                            title="No Audit Trails"
                                            description="No activity logs detected in the current transmission cycle."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-300 font-mono italic">
                                                        {format(new Date(log.createdAt), "HH:mm:ss")}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                                                        {format(new Date(log.createdAt), "MMM dd, yyyy")}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                                    {log.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white group-hover:text-white transition-colors">{log.user.name}</div>
                                                    <div className="text-[9px] text-slate-500 font-medium font-mono">{log.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5 text-slate-600" />
                                                <span className="text-xs font-black text-slate-400 font-mono tracking-tight">{log.ip || "0.0.0.0"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                                log.success ? "bg-white/10 text-white border-white/20" : "bg-neutral-800 text-neutral-400 border-white/10"
                                            )}>
                                                {log.success ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                                {log.success ? "VALIDATED" : "BREACH / FAIL"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    {log.user.role}
                                                </span>
                                                <div className="text-[8px] text-slate-600 font-medium truncate max-w-[200px] italic">
                                                    {log.userAgent}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                        <Terminal className="w-3.5 h-3.5 text-white" />
                        Platform Entropy: <span className="text-white">Stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
