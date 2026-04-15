"use client";

import React, { useState } from "react";
import { 
 Settings, 
 User, 
 Shield, 
 Bell, 
 Globe, 
 CreditCard, 
 Lock, 
 Trash2,
 Save,
 CheckCircle2,
 Zap,
 History
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

export default function SupplierSettingsPage() {
 const { user } = useAuth();
 const [saving, setSaving] = useState(false);

 const handleSave = () => {
 setSaving(true);
 setTimeout(() => {
 setSaving(false);
 toast.success("Identity Node Parameters Updated.");
 }, 1500);
 };

 return (
 <div className="space-y-10 pb-20 max-w-5xl">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
 <Settings className="w-8 h-8 text-[#D4AF37]" />
 Node Config
 </h1>
 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Identity & Protocol Settings</p>
 </div>

 <div className="flex items-center gap-3">
 <Button 
 onClick={handleSave} 
 disabled={saving}
 className="rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-lg shadow-[#D4AF37]/20"
 >
 {saving ? "Syncing..." : "Save Manifest"}
 <Save className="w-4 h-4 ml-2" />
 </Button>
 </div>
 </div>

 {/* Profile Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="lg:col-span-2 space-y-8">
 <Card className="bg-card/20 border-white/5 rounded-lg overflow-hidden shadow-2xl">
 <CardHeader className="p-10 border-b border-white/5">
 <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
 <User className="w-5 h-5 text-[#D4AF37]" />
 Identity Profile
 </CardTitle>
 </CardHeader>
 <CardContent className="p-10 space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 px-2 ">Node Identifier</label>
 <input 
 type="text" 
 readOnly
 className="w-full bg-muted/20 border border-white/5 rounded-lg px-6 py-4 text-sm font-bold opacity-50 select-none cursor-not-allowed"
 value={user?.id || "ID-XXXX"}
 />
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 px-2 ">Signal Protocol (Email)</label>
 <input 
 type="email" 
 readOnly
 className="w-full bg-muted/20 border border-white/5 rounded-lg px-6 py-4 text-sm font-bold opacity-50"
 value={user?.email || "node@signal.io"}
 />
 </div>
 <div className="space-y-3 md:col-span-2">
 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 px-2 ">Business Designation</label>
 <input 
 type="text" 
 placeholder="Identity Node Name..."
 className="w-full bg-card/30 border border-white/5 rounded-lg px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-inner uppercase tracking-wider"
 defaultValue={user?.name || ""}
 />
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card/20 border-white/5 rounded-lg overflow-hidden shadow-2xl">
 <CardHeader className="p-10 border-b border-white/5">
 <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
 <Shield className="w-5 h-5 text-emerald-500" />
 Security Protocols
 </CardTitle>
 </CardHeader>
 <CardContent className="p-10 space-y-8">
 <div className="flex items-center justify-between p-6 rounded-lg bg-muted/10 border border-white/5">
 <div className="flex items-center gap-5">
 <div className="size-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
 <Lock className="w-6 h-6" />
 </div>
 <div>
 <p className="font-black uppercase tracking-tighter">Two-Factor Encryption</p>
 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mt-1">Multi-layer signal protection</p>
 </div>
 </div>
 <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 font-black uppercase text-[9px] tracking-widest">Configure</Button>
 </div>

 <div className="flex items-center justify-between p-6 rounded-lg bg-muted/10 border border-white/5">
 <div className="flex items-center gap-5">
 <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
 <Zap className="w-6 h-6" />
 </div>
 <div>
 <p className="font-black uppercase tracking-tighter">Node Verification Status</p>
 <div className="flex items-center gap-2 mt-1">
 <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Node Authenticated</span>
 </div>
 </div>
 </div>
 <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-50" />
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="space-y-8">
 <Card className="bg-[#D4AF37]/5 border-[#D4AF37]/20 rounded-lg overflow-hidden shadow-2xl">
 <CardContent className="p-10 text-center space-y-6">
 <div className="size-20 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center mx-auto text-[#D4AF37]">
 <Shield className="w-10 h-10" />
 </div>
 <h3 className="text-xl font-black uppercase tracking-tighter text-[#D4AF37]">Identity Verified</h3>
 <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]/60 leading-relaxed max-w-[200px] mx-auto">Your supplier node has been encrypted and verified on the global ledger.</p>
 </CardContent>
 </Card>

 <Card className="bg-red-500/5 border-red-500/20 rounded-lg overflow-hidden shadow-2xl group cursor-pointer hover:bg-red-500/10 transition-colors">
 <CardContent className="p-10 text-center space-y-6">
 <div className="size-16 bg-red-500/10 rounded-lg flex items-center justify-center mx-auto text-red-500 group-hover:scale-110 transition-transform">
 <Trash2 className="w-8 h-8" />
 </div>
 <h3 className="text-lg font-black uppercase tracking-tighter text-red-500">Decommission Node</h3>
 <p className="text-[9px] font-black uppercase tracking-widest text-red-500/40 leading-relaxed mx-auto ">Warning: This action terminates all active distribution signals and ledger entries.</p>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
