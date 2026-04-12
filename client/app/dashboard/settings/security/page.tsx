"use client";

import { useState, useEffect } from "react";
import { 
 Shield, 
 Key, 
 History, 
 Smartphone, 
 CheckCircle2, 
 AlertTriangle,
 ChevronRight,
 RefreshCw,
 Mail,
 X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";
import EmailPreferences from "@/components/dashboard/EmailPreferences";

type LoginHistory = {
 id: string;
 ip: string | null;
 userAgent: string | null;
 success: boolean;
 createdAt: string;
};

type MFAFactor = {
 id: string;
 type: string;
 status: "verified" | "unverified";
 friendlyName?: string;
};

export default function SecuritySettingsPage() {
 const [history, setHistory] = useState<LoginHistory[]>([]);
 const [factors, setFactors] = useState<MFAFactor[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isEnrolling, setIsEnrolling] = useState(false);
 const [enrollData, setEnrollData] = useState<{ id: string; totp: { qr_code: string; secret: string; uri: string } } | null>(null);
 const [otpCode, setOtpCode] = useState("");
 const [isVerifying, setIsVerifying] = useState(false);

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 setIsLoading(true);
 try {
 const [historyRes, factorsRes] = await Promise.all([
 axios.get("/api/auth/login-history"),
 axios.get("/api/auth/mfa/list") // Wait, I need to implement this
 ]).catch(async (err) => {
 // If factors list API isn't ready or fails, at least get history
 const hRes = await axios.get("/api/auth/login-history");
 return [hRes, { data: [] }];
 });
 
 setHistory(historyRes.data);
 setFactors(factorsRes.data);
 } catch (error) {
 console.error("Failed to fetch security data", error);
 } finally {
 setIsLoading(false);
 }
 };

 const startEnrollment = async () => {
 setIsEnrolling(true);
 try {
 const res = await axios.post("/api/auth/mfa/enroll");
 setEnrollData(res.data);
 } catch (error) {
 toast.error("Failed to start MFA enrollment");
 } finally {
 setIsEnrolling(false);
 }
 };

 const verifyEnrollment = async () => {
 if (!enrollData || !otpCode) return;
 setIsVerifying(true);
 try {
 await axios.post("/api/auth/mfa/verify", {
 factorId: enrollData.id,
 code: otpCode
 });
 toast.success("MFA enabled successfully!");
 setEnrollData(null);
 setOtpCode("");
 fetchData();
 } catch (error) {
 toast.error("Invalid verification code");
 } finally {
 setIsVerifying(false);
 }
 };

 const unenrollFactor = async (factorId: string) => {
 if (!confirm("Are you sure you want to disable Multi-Factor Authentication?")) return;
 try {
 await axios.post("/api/auth/mfa/unenroll", { factorId }); // Need to implement this
 toast.success("MFA disabled");
 fetchData();
 } catch (error) {
 toast.error("Failed to disable MFA");
 }
 };

 if (isLoading && history.length === 0) {
 return (
 <div className="p-8 flex items-center justify-center min-h-[400px]">
 <RefreshCw className="w-8 h-8 animate-spin text-primary" />
 </div>
 );
 }

 const isMfaEnabled = factors.some(f => f.status === "verified");

 return (
 <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10 pb-20">
 <div className="space-y-2">
 <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
 <Shield className="text-primary w-8 h-8" />
 Security Center
 </h1>
 <p className="text-muted-foreground">
 Protect your terminal and monitor access to your trade operations.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 {/* MFA Section */}
 <section className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
 <div className="p-6 border-b border-border bg-muted/30">
 <h2 className="text-xl font-bold flex items-center gap-2">
 <Smartphone className="w-5 h-5 text-primary" />
 Multi-Factor Authentication
 </h2>
 </div>
 <div className="p-6 space-y-6">
 <div className="flex items-start gap-4">
 <div className={`p-3 rounded-full ${isMfaEnabled ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
 {isMfaEnabled ? <CheckCircle2 className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
 </div>
 <div className="space-y-1">
 <h3 className="font-bold">Two-Step Verification</h3>
 <p className="text-sm text-muted-foreground">
 Protect your account with an extra layer of security. Once enabled, you'll be prompted for a code from your authenticator app.
 </p>
 </div>
 </div>

 {isMfaEnabled ? (
 <div className="space-y-4">
 <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
 <span className="text-sm font-semibold">Active: Authenticator App</span>
 </div>
 <Button 
 variant="ghost" 
 size="sm" 
 className="text-destructive hover:text-destructive hover:bg-destructive/10"
 onClick={() => unenrollFactor(factors[0].id)}
 >
 Disable
 </Button>
 </div>
 </div>
 ) : (
 <div className="pt-2">
 {!enrollData ? (
 <Button onClick={startEnrollment} disabled={isEnrolling}>
 {isEnrolling ? 'Loading...' : 'Enable Two-Step Verification'}
 </Button>
 ) : (
 <div className="p-6 rounded-lg bg-muted/40 border border-border relative">
 <button 
 className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
 onClick={() => setEnrollData(null)}
 >
 <X className="w-5 h-5" />
 </button>
 
 <div className="space-y-6 flex flex-col items-center text-center">
 <div className="space-y-2">
 <h4 className="font-bold text-lg">Scan QR Code</h4>
 <p className="text-sm text-muted-foreground max-w-xs">
 Scan this QR code in your authenticator app (Google Authenticator, Authy, etc.)
 </p>
 </div>
 
 <div className="p-4 bg-white rounded-xl">
 <QRCodeSVG value={enrollData.totp.uri} size={180} />
 </div>

 <div className="space-y-4 w-full max-w-[280px]">
 <div className="space-y-1">
 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
 Enter Verification Code
 </label>
 <input 
 type="text" 
 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-primary/20 focus:outline-none"
 placeholder="000000"
 maxLength={6}
 value={otpCode}
 onChange={(e) => setOtpCode(e.target.value)}
 />
 </div>
 <Button 
 className="w-full" 
 onClick={verifyEnrollment}
 disabled={isVerifying || otpCode.length !== 6}
 >
 {isVerifying ? 'Verifying...' : 'Complete Setup'}
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </section>

 {/* Backup Codes Placeholder or Info */}
 <section className="bg-card border border-border rounded-lg p-6 flex items-center justify-between group cursor-not-allowed opacity-60">
 <div className="flex items-center gap-4">
 <div className="p-3 rounded-xl bg-muted border border-border">
 <Key className="w-5 h-5" />
 </div>
 <div className="space-y-0.5">
 <h3 className="font-bold">Backup Recovery Codes</h3>
 <p className="text-xs text-muted-foreground">Generate one-time codes to use if you lose your device.</p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-muted-foreground" />
 </section>

 {/* Email Preferences Section */}
 <section className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
 <div className="p-6 border-b border-border bg-muted/30">
 <h2 className="text-xl font-bold flex items-center gap-2">
 <Mail className="w-5 h-5 text-primary" />
 Notification Settings
 </h2>
 </div>
 <div className="p-6">
 <EmailPreferences />
 </div>
 </section>
 </div>

 <div className="space-y-6">
 {/* Device Control / Info */}
 <div className="bg-card border border-border rounded-lg p-6 space-y-4">
 <h3 className="font-bold flex items-center gap-2">
 <History className="w-4 h-4 text-primary" />
 Recent Access
 </h3>
 <div className="space-y-4">
 {history.length > 0 ? history.map((item) => (
 <div key={item.id} className="flex items-start gap-3 text-sm">
 <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.success ? 'bg-green-500' : 'bg-destructive'}`} />
 <div className="space-y-1">
 <p className="font-semibold leading-none">{item.ip || 'Unknown IP'}</p>
 <p className="text-xs text-muted-foreground line-clamp-1">
 {item.userAgent || 'Unknown Device'}
 </p>
 <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
 {format(new Date(item.createdAt), 'MMM d, HH:mm')}
 </p>
 </div>
 </div>
 )) : (
 <p className="text-xs text-muted-foreground ">No recent activity found.</p>
 )}
 </div>
 <Button variant="ghost" size="sm" className="w-full text-xs" onClick={fetchData}>
 Refresh Audit Log
 </Button>
 </div>

 <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
 <div className="flex items-center gap-2 text-primary">
 <AlertTriangle className="w-4 h-4" />
 <h4 className="text-sm font-bold">Security Tip</h4>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Never share your credentials OR your Multi-Factor verification codes with anyone, including Renote Exim support.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
