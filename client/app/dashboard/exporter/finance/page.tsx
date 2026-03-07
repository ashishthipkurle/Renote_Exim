"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { authFetch, formatCurrency } from "@/lib/api-utils";

// Safe useLayoutEffect that falls back to useEffect on the server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  orderNumber: string;
  amount: number;
  status: string;
  paidAt: string | null;
  buyer: string;
}

interface FinanceData {
  role: string;
  available: number;
  pending: number;
  lastPayout: number;
  recentInvoices: Invoice[];
}

interface MonthlyPoint {
  month: string;
  revenue: number;
  orderCount: number;
}

interface AnalyticsData {
  monthlyRevenue: MonthlyPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function statusCfg(status: string) {
  const s = status.toUpperCase();
  if (s === "PAID") return { label: "Completed", dot: "#22c55e", bg: "rgba(34,197,94,0.10)", text: "#22c55e", border: "rgba(34,197,94,0.25)" };
  if (s === "PENDING") return { label: "Pending", dot: "#f59e0b", bg: "rgba(245,158,11,0.10)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" };
  if (s === "PARTIAL") return { label: "Partial", dot: "#38bdf8", bg: "rgba(56,189,248,0.10)", text: "#38bdf8", border: "rgba(56,189,248,0.25)" };
  return { label: status, dot: "#94a3b8", bg: "rgba(148,163,184,0.10)", text: "#94a3b8", border: "rgba(148,163,184,0.25)" };
}

// ─── PDF Generation (client-side, no external deps) ───────────────────────────

function fmtUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
}

/** 
 * Triggers a direct browser download of the statement as an HTML file
 * that Chrome/Edge will render as a printable PDF via Ctrl+P / Save as PDF.
 * Uses a hidden <a download> — no popup blocker issues, no print dialog forced on user.
 */
function downloadAsFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Small delay before cleanup so browser has time to start the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

function buildStatementHTML(invoices: Invoice[], totalRevenue: number): string {
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const currentYear = new Date().getFullYear();
  const rows = invoices.map(inv => [
    "<tr>",
    `<td><strong>${inv.orderNumber}</strong></td>`,
    `<td>${inv.buyer}</td>`,
    `<td>${fmtDate(inv.paidAt)}</td>`,
    `<td class="right-align"><strong>${fmtUSD(inv.amount)}</strong></td>`,
    "</tr>",
  ].join("")).join("");

  return [
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\">",
    "<title>Account Statement — Exporter Platform</title>",
    "<style>",
    "@import url(\'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap\');",
    "*{margin:0;padding:0;box-sizing:border-box}",
    "body{font-family:\'IBM Plex Mono\',monospace;background:#fff;color:#0a0f1e;padding:48px;max-width:900px;margin:0 auto}",
    ".header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #e2e8f0}",
    ".logo{font-size:22px;font-weight:700;color:#1d4ed8;letter-spacing:-0.03em}",
    ".logo span{color:#0a0f1e}",
    ".badge{font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;margin-top:4px}",
    "h1{font-size:26px;font-weight:700;color:#0a0f1e;letter-spacing:-0.03em;margin-bottom:6px}",
    ".meta{color:#64748b;font-size:12px;line-height:2;margin-bottom:28px}",
    ".accent{display:inline-block;width:5px;height:5px;border-radius:50%;background:#1d4ed8;margin-right:7px;vertical-align:middle}",
    ".amount-box{background:#f0f6ff;border:2px solid #bfdbfe;border-radius:12px;padding:22px 28px;margin:28px 0;display:flex;justify-content:space-between;align-items:center}",
    ".amount-label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600}",
    ".amount-value{font-size:34px;font-weight:700;color:#1d4ed8}",
    ".section-title{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:12px;font-weight:600}",
    "table{width:100%;border-collapse:collapse;font-size:12px}",
    "th{text-align:left;padding:10px 12px;border-bottom:2px solid #e2e8f0;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600}",
    "td{padding:11px 12px;border-bottom:1px solid #f1f5f9;color:#0a0f1e;vertical-align:middle}",
    "tr:last-child td{border-bottom:none}",
    "tr:hover td{background:#f8fafc}",
    ".right-align{text-align:right}",
    ".status-paid{display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,0.1);color:#16a34a;border:1px solid rgba(34,197,94,0.25);padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase}",
    ".footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.8}",
    "@media print{body{padding:0}@page{margin:1.5cm;size:A4}}",
    "</style></head><body>",
    "<div class=\"header\">",
    "<div><div class=\"logo\">EXPORT<span>ER</span></div><div class=\"badge\">Financial Statement</div></div>",
    `<div style=\"text-align:right;font-size:11px;color:#64748b\"><div style=\"font-weight:700;color:#0a0f1e;margin-bottom:4px\">OFFICIAL DOCUMENT</div><div>${generatedDate}</div></div>`,
    "</div>",
    "<h1>Account Statement</h1>",
    "<div class=\"meta\">",
    `<div><span class=\"accent\"></span>Generated: ${generatedDate}</div>`,
    `<div><span class=\"accent\"></span>Total Transactions: ${invoices.length} completed</div>`,
    "</div>",
    "<div class=\"amount-box\">",
    "<div><div class=\"amount-label\">Total Completed Revenue</div></div>",
    `<div class=\"amount-value\">${fmtUSD(totalRevenue)}</div>`,
    "</div>",
    "<div class=\"section-title\">Transaction History — Paid Orders</div>",
    "<table><thead><tr>",
    "<th>#</th><th>Order ID</th><th>Client / Buyer</th><th>Date Paid</th><th class=\"right-align\">Amount</th><th class=\"right-align\">Status</th>",
    "</tr></thead><tbody>",
    invoices.map((inv, i) => [
      "<tr>",
      `<td style=\"color:#94a3b8\">${i + 1}</td>`,
      `<td><strong>${inv.orderNumber}</strong></td>`,
      `<td>${inv.buyer}</td>`,
      `<td>${fmtDate(inv.paidAt)}</td>`,
      `<td class=\"right-align\"><strong>${fmtUSD(inv.amount)}</strong></td>`,
      `<td class=\"right-align\"><span class=\"status-paid\">● Paid</span></td>`,
      "</tr>",
    ].join("")).join(""),
    "</tbody></table>",
    `<div class=\"footer\">This statement was automatically generated by Exporter Platform · ${currentYear}<br>For queries contact support@exporterplatform.com</div>`,
    "</body></html>",
  ].join("\n");
}

function generateStatementPDF(invoices: Invoice[], totalRevenue: number) {
  if (!invoices.length) {
    alert("No completed invoices to include in the statement.");
    return;
  }
  const html = buildStatementHTML(invoices, totalRevenue);
  const date = new Date().toISOString().slice(0, 10);
  downloadAsFile(html, `exporter-statement-${date}.html`);
}

function generateInvoicePDF(inv: Invoice) {
  const cfg = statusCfg(inv.status);
  const amountFormatted = fmtUSD(inv.amount);
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const currentYear = new Date().getFullYear();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:var(--font-manrope),sans-serif;background:#ffffff;color:#0a0f1e;padding:48px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;padding-bottom:24px;border-bottom:2px solid #e2e8f0}
    .logo{font-size:20px;font-weight:700;color:#1d4ed8;letter-spacing:-0.03em}
    .logo span{color:#0a0f1e}
    .badge{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:${cfg.bg};color:${cfg.text};border:1px solid ${cfg.border}}
    h1{font-size:28px;font-weight:700;color:#0a0f1e;letter-spacing:-0.03em;margin-bottom:8px}
    .meta{color:#64748b;font-size:12px;line-height:1.8}
    .section{margin:32px 0}
    .section-title{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:16px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
    .info-item label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:4px}
    .info-item span{font-size:14px;font-weight:600;color:#0a0f1e}
    .amount-box{background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:24px;margin:32px 0;display:flex;justify-content:space-between;align-items:center}
    .amount-label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em}
    .amount-value{font-size:36px;font-weight:700;color:#1d4ed8}
    .footer{margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
    .accent{display:inline-block;width:4px;height:4px;border-radius:50%;background:#1d4ed8;margin-right:6px;vertical-align:middle}
  </style></head><body>
  <div class="header">
    <div class="logo">EXPORT<span>ER</span></div>
    <span class="badge">${cfg.label.toUpperCase()}</span>
  </div>
  <h1>Invoice</h1>
  <div class="meta">
    <div><span class="accent"></span>Invoice ID: ${inv.id}</div>
    <div><span class="accent"></span>Order: ${inv.orderNumber}</div>
    <div><span class="accent"></span>Generated: ${generatedDate}</div>
  </div>
  <div class="section">
    <div class="section-title">Billing Details</div>
    <div class="info-grid">
      <div class="info-item"><label>Buyer / Client</label><span>${inv.buyer}</span></div>
      <div class="info-item"><label>Payment Status</label><span style="color:${cfg.text}">${cfg.label}</span></div>
      <div class="info-item"><label>Payment Date</label><span>${fmtDate(inv.paidAt)}</span></div>
      <div class="info-item"><label>Order Reference</label><span>${inv.orderNumber}</span></div>
    </div>
  </div>
  <div class="amount-box">
    <div><div class="amount-label">Total Amount Due</div></div>
    <div class="amount-value">${amountFormatted}</div>
  </div>
  <div class="footer">This invoice was automatically generated by Exporter Platform · ${currentYear}</div>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const date = new Date().toISOString().slice(0, 10);
  downloadAsFile(html, `invoice-${inv.orderNumber}-${date}.html`);
}

// ─── Mini Line Chart ──────────────────────────────────────────────────────────

function RevenueChart({ data, dark }: { data: MonthlyPoint[]; dark: boolean }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: MonthlyPoint } | null>(null);
  const [drawn, setDrawn] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { const t = setTimeout(() => setDrawn(true), 50); return () => clearTimeout(t); }, [data]);

  if (!data.length) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", fontSize: 13, fontFamily: "var(--font-manrope), sans-serif" }}>
        No revenue data yet
      </div>
    );
  }

  const W = 800, H = 220, padL = 60, padR = 24, padT = 20, padB = 44;
  const cW = W - padL - padR, cH = H - padT - padB;
  const maxV = Math.max(...data.map(d => d.revenue), 1);

  const xs = (i: number) => (i / Math.max(data.length - 1, 1)) * cW;
  const ys = (v: number) => cH - (v / maxV) * cH;

  const pts = data.map((d, i) => ({ x: xs(i), y: ys(d.revenue), d }));
  let linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  let areaPath = `${linePath} L${pts[pts.length - 1].x},${cH} L0,${cH} Z`;

  // smooth with cubic bezier
  if (pts.length > 1) {
    const smooth = pts.map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
    }).join(" ");
    linePath = smooth;
    areaPath = `${smooth} L${pts[pts.length - 1].x},${cH} L0,${cH} Z`;
  }

  const gridColor = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const labelColor = dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  const blue = "#2563EB";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={blue} stopOpacity={dark ? "0.22" : "0.10"} />
            <stop offset="100%" stopColor={blue} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ll" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${padL},${padT})`}>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = cH * (1 - t);
            const v = maxV * t;
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={cW} y2={y} stroke={gridColor} strokeWidth="1" />
                <text x={-8} y={y + 4} textAnchor="end" fill={labelColor} fontSize="10" fontFamily="'IBM Plex Mono',monospace">
                  {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#lg)" style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.4s" }} />

          <path
            d={linePath} stroke="url(#ll)" strokeWidth="2.5" fill="none" filter="url(#glow)"
            style={{ strokeDasharray: 3000, strokeDashoffset: drawn ? 0 : 3000, transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
          />

          {pts.map((p, i) => {
            const monthDate = new Date(data[i].month);
            const label = MONTH_SHORT[monthDate.getMonth()] ?? data[i].month.slice(0, 3);
            return (
              <g key={i}>
                <text x={p.x} y={cH + 18} textAnchor="middle" fill={labelColor} fontSize="10" fontFamily="'IBM Plex Mono',monospace">{label}</text>
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" style={{ cursor: "crosshair" }}
                  onMouseEnter={() => setTooltip({ x: p.x + padL, y: p.y + padT, point: data[i] })}
                  onMouseLeave={() => setTooltip(null)}
                />
                <circle cx={p.x} cy={p.y} r="4" fill={blue} stroke={dark ? "#0e1525" : "#ffffff"} strokeWidth="2.5"
                  style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.2s ${0.04 * i + 0.4}s` }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {tooltip && (
        <div style={{
          position: "absolute",
          left: `${(tooltip.x / W) * 100}%`,
          top: `${(tooltip.y / H) * 100}%`,
          transform: "translate(-50%, -120%)",
          pointerEvents: "none",
          background: dark ? "#1a2235" : "#ffffff",
          border: `1px solid ${dark ? "rgba(37,99,235,0.35)" : "rgba(37,99,235,0.2)"}`,
          borderRadius: 10, padding: "8px 14px", zIndex: 20,
          boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          fontFamily: "var(--font-manrope), sans-serif",
        }}>
          <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", marginBottom: 3 }}>
            {MONTH_SHORT[new Date(tooltip.point.month).getMonth()]} · {tooltip.point.orderCount} orders
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2563EB" }}>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(tooltip.point.revenue)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon, label, value, sub, accentColor, dark, animDelay,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  accentColor: string; dark: boolean; animDelay: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, minWidth: 180,
        background: dark ? "rgba(21,28,42,0.75)" : "#ffffff",
        border: `1px solid ${hovered
          ? `${accentColor}55`
          : dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: 18, padding: "24px 26px",
        boxShadow: hovered
          ? `0 0 0 1px ${accentColor}33, 0 12px 40px ${accentColor}1a`
          : dark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 14px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-4px) scale(1.015)" : "translateY(0)",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        cursor: "default", position: "relative", overflow: "hidden",
        animation: `fadeUp 0.35s ease both`,
        animationDelay: `${animDelay}ms`,
      }}
    >
      {/* accent glow blob */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle at 80% 20%, ${accentColor}18 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* accent left bar */}
      <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, borderRadius: "0 3px 3px 0", background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}44)` }} />

      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 10, fontFamily: "var(--font-manrope), sans-serif", textTransform: "uppercase", letterSpacing: "0.09em", color: dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: dark ? "#ffffff" : "#0a0f1e", fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "var(--font-manrope), sans-serif", marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = statusCfg(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.text,
      border: `1px solid ${cfg.border}`,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, fontFamily: "var(--font-manrope), sans-serif",
      letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────

function DownloadBtn({ inv, dark }: { inv: Invoice; dark: boolean }) {
  const [state, setState] = useState<"idle" | "done">("idle");
  const disabled = inv.status.toUpperCase() !== "PAID";

  const handle = () => {
    if (disabled) return;
    generateInvoicePDF(inv);
    setState("done");
    setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button
      onClick={handle}
      disabled={disabled}
      title={disabled ? "Only available for completed payments" : "Download PDF Invoice"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: disabled ? "transparent" : state === "done" ? "rgba(34,197,94,0.12)" : "rgba(37,99,235,0.10)",
        color: disabled ? (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)") : state === "done" ? "#22c55e" : "#2563EB",
        border: `1px solid ${disabled ? "transparent" : state === "done" ? "rgba(34,197,94,0.3)" : "rgba(37,99,235,0.3)"}`,
        borderRadius: 7, padding: "4px 11px",
        fontSize: 10, fontWeight: 700, fontFamily: "var(--font-manrope), sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s", letterSpacing: "0.04em",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {state === "done" ? (
        <>✓ Saved</>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          PDF
        </>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExporterFinancePage() {
  const [dark, setDark] = useState(true);
  const [data, setData] = useState<FinanceData | null>(null);
  const [chartData, setChartData] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    authFetch<FinanceData>("/api/dashboard/finance")
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Computed totals
  const totalRevenue = data?.available ?? 0;
  const pendingTotal = data?.pending ?? 0;
  const completedTotal = data?.recentInvoices?.filter(i => i.status.toUpperCase() === "PAID").reduce((s, i) => s + i.amount, 0) ?? 0;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const filteredInvoices = (data?.recentInvoices ?? []).filter(inv => {
    if (statusFilter === "ALL") return true;
    return inv.status.toUpperCase() === statusFilter;
  });

  // ── Theme vars ──
  const bg = dark ? "#080c14" : "#f0f4f8";
  const surface = dark ? "rgba(21,28,42,0.75)" : "rgba(255,255,255,0.9)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const text = dark ? "#ffffff" : "#0a0f1e";
  const muted = dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)";
  const rowHover = dark ? "rgba(37,99,235,0.05)" : "rgba(37,99,235,0.04)";

  // Inject dynamic CSS client-side only — avoids SSR/hydration mismatch
  useIsomorphicLayoutEffect(() => {
    const id = "fin-dynamic-styles";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = [
      "* { box-sizing: border-box; }",
      "::-webkit-scrollbar { width: 4px; height: 4px; }",
      "::-webkit-scrollbar-track { background: transparent; }",
      "::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.25); border-radius: 4px; }",
      `.fin-row:hover td { background: ${rowHover} !important; }`,
      ".fin-row td { transition: background 0.15s; }",
      ".dl-btn:hover { opacity: 0.85; }",
      "@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }",
      "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",
      "@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }",
    ].join("\n");
    return () => { el?.remove(); };
  }, [dark]);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Finance Overview</h1>
            <p className="text-slate-400 mt-1">Revenue breakdown, payout status, and invoices.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>


            {/* Download statement */}
            <button
              type="button"
              className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors flex items-center gap-2"
              disabled={downloading || loading}
              onClick={() => {
                setDownloading(true);
                try {
                  generateStatementPDF(
                    (data?.recentInvoices ?? []).filter(i => i.status.toUpperCase() === "PAID"),
                    completedTotal
                  );
                } finally {
                  setTimeout(() => setDownloading(false), 1500);
                }
              }}
            >
              {downloading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Preparing…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Statement
                </>
              )}
            </button>


          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* ── Summary Cards ── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <SummaryCard
              dark={dark} animDelay={0} accentColor="#2563EB"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
              label="Total Revenue"
              value={loading ? "—" : fmt(totalRevenue)}
              sub="Available balance"
            />
            <SummaryCard
              dark={dark} animDelay={80} accentColor="#f59e0b"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
              label="Pending Payments"
              value={loading ? "—" : fmt(pendingTotal)}
              sub="Awaiting settlement"
            />
            <SummaryCard
              dark={dark} animDelay={160} accentColor="#22c55e"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              label="Completed Payments"
              value={loading ? "—" : fmt(completedTotal)}
              sub={`${(data?.recentInvoices ?? []).filter(i => i.status.toUpperCase() === "PAID").length} settled invoices`}
            />
          </div>

          {/* ── Revenue Chart ── */}
          <div style={{
            background: surface, border: `1px solid ${border}`,
            borderRadius: 20, padding: "28px 28px 20px",
            marginBottom: 24,
            backdropFilter: "blur(12px)",
            boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.25)" : "0 2px 16px rgba(0,0,0,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: text, letterSpacing: "-0.02em" }}>Revenue Trend</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>Monthly earnings performance</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10, color: muted }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 20, height: 2, background: "linear-gradient(to right,#1d4ed8,#60a5fa)", display: "inline-block", borderRadius: 2 }} />
                  Revenue
                </span>
              </div>
            </div>
            {loading ? (
              <div style={{ height: 220, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: 12 }}>
                Loading chart…
              </div>
            ) : (
              <RevenueChart data={chartData} dark={dark} />
            )}
          </div>

          {/* ── Payment History Table ── */}
          <div style={{
            background: surface, border: `1px solid ${border}`,
            borderRadius: 20, overflow: "hidden",
            backdropFilter: "blur(12px)",
            boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.25)" : "0 2px 16px rgba(0,0,0,0.08)",
          }}>
            {/* Table header row */}
            <div style={{ padding: "20px 24px 0", borderBottom: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: text, letterSpacing: "-0.02em" }}>Payment History</div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>
                    {loading ? "Loading…" : `${filteredInvoices.length} transaction${filteredInvoices.length !== 1 ? "s" : ""}`}
                  </div>
                </div>

                {/* Status filter pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["ALL", "PAID", "PENDING", "PARTIAL"].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      style={{
                        padding: "4px 12px", borderRadius: 20, border: "1px solid",
                        borderColor: statusFilter === s ? "#2563EB" : border,
                        background: statusFilter === s ? "rgba(37,99,235,0.12)" : "transparent",
                        color: statusFilter === s ? "#2563EB" : muted,
                        fontSize: 10, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.04em",
                      }}
                    >
                      {s === "ALL" ? "All" : s === "PAID" ? "Completed" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div style={{ padding: 24 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      height: 48, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius: 8, marginBottom: 8,
                      animation: "pulse 1.5s ease-in-out infinite"
                    }} />
                  ))}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: muted, fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📄</div>
                  No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""} invoices found
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      {["Order ID", "Client", "Date", "Amount", "Status", "Invoice"].map((h, i) => (
                        <th key={h} style={{
                          padding: "10px 20px", textAlign: i >= 3 ? "right" : "left",
                          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em",
                          color: muted,
                          background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                          whiteSpace: "nowrap",
                          ...(i === 4 ? { textAlign: "center" as const } : {}),
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv, idx) => (
                      <tr key={inv.id} className="fin-row" style={{ borderBottom: idx < filteredInvoices.length - 1 ? `1px solid ${border}` : "none" }}>
                        <td style={{ padding: "13px 20px", fontSize: 11, color: dark ? "rgba(255,255,255,0.85)" : "#0a0f1e", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {inv.orderNumber}
                        </td>
                        <td style={{ padding: "13px 20px", color: dark ? "rgba(255,255,255,0.7)" : "#334155", whiteSpace: "nowrap" }}>
                          {inv.buyer}
                        </td>
                        <td style={{ padding: "13px 20px", color: muted, whiteSpace: "nowrap" }}>
                          {fmtDate(inv.paidAt)}
                        </td>
                        <td style={{ padding: "13px 20px", textAlign: "right", fontWeight: 700, color: dark ? "#ffffff" : "#0a0f1e", whiteSpace: "nowrap" }}>
                          {fmt(inv.amount)}
                        </td>
                        <td style={{ padding: "13px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <StatusBadge status={inv.status} />
                        </td>
                        <td style={{ padding: "13px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <DownloadBtn inv={inv} dark={dark} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer hint */}
            {!loading && filteredInvoices.length > 0 && (
              <div style={{ padding: "12px 24px", borderTop: `1px solid ${border}`, fontSize: 10, color: muted, textAlign: "right" }}>
                PDF download available for completed orders only
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
