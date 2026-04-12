import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";

export default function HomeFooter() {
 const { t } = useTranslation();
 return (
 <footer className="bg-background border-t border-border pt-20 pb-10">
 <div className="max-w-7xl mx-auto px-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
 <div className="col-span-1 md:col-span-1">
 <div className="flex items-center gap-2 mb-6">
 <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
 <span className="material-icons text-sm">public</span>
 </div>
 <span className="text-xl font-bold tracking-wide text-foreground">
 RANOTE<span className="text-primary">EXIM</span>
 </span>
 </div>
 <p className="text-muted-foreground text-sm leading-relaxed mb-6">
 {t("footer.description", "Reimagining global trade infrastructure for the digital age. Secure, fast, and transparent.")}
 </p>
 <div className="flex gap-4">
 <a
 className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
 href="#"
 aria-label="Facebook"
 >
 <i className="material-icons text-sm">facebook</i>
 </a>
 <a
 className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
 href="#"
 aria-label="Work"
 >
 <i className="material-icons text-sm">work</i>
 </a>
 <a
 className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
 href="#"
 aria-label="Community"
 >
 <i className="material-icons text-sm">flutter_dash</i>
 </a>
 </div>
 </div>

 <div>
 <h4 className="text-foreground font-bold mb-6">{t("footer.col_platform", "Platform")}</h4>
 <ul className="space-y-3 text-sm text-muted-foreground">
 <li>
 <Link className="hover:text-primary transition-colors" href="/products">
 {t("marketplace", "Marketplace")}
 </Link>
 </li>
 <li>
 <Link className="hover:text-primary transition-colors" href="/dashboard/admin/shipments">
 {t("sidebar.shipments", "Logistics")}
 </Link>
 </li>
 <li>
 <Link className="hover:text-primary transition-colors" href="/dashboard/admin/analytics">
 {t("sidebar.analytics", "Finance")}
 </Link>
 </li>
 <li>
 <Link className="hover:text-primary transition-colors" href="/dashboard/admin/notifications">
 {t("sidebar.notifications", "Compliance")}
 </Link>
 </li>
 </ul>
 </div>

 <div>
 <h4 className="text-slate-900 dark:text-white font-bold mb-6">{t("footer.col_company", "Company")}</h4>
 <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-500">
 <li>
 <Link className="hover:text-primary transition-colors" href="/about">
 {t("footer.about", "About Us")}
 </Link>
 </li>
 <li>
 <Link className="hover:text-primary transition-colors" href="/careers">
 {t("footer.careers", "Careers")}
 </Link>
 </li>
 <li>
 <Link className="hover:text-primary transition-colors" href="/press">
 {t("footer.press", "Press")}
 </Link>
 </li>
 <li>
 <Link className="hover:text-primary transition-colors" href="/contact">
 {t("contact", "Contact")}
 </Link>
 </li>
 </ul>
 </div>

 <div>
 <h4 className="text-slate-900 dark:text-white font-bold mb-6">{t("footer.col_subscribe", "Subscribe")}</h4>
 <p className="text-slate-600 dark:text-slate-500 text-sm mb-4">{t("footer.subscribe_desc", "Get the latest trade insights.")}</p>
 <div className="flex shadow-sm rounded-l-lg">
 <input
 className="bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-l-lg px-4 py-3 text-sm w-full focus:outline-none focus:border-primary transition-colors"
 placeholder={t("footer.email_placeholder", "Email address")}
 type="email"
 />
 <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors primary-glow-hover" type="button" aria-label="Subscribe">
 <span className="material-icons text-sm">arrow_forward</span>
 </button>
 </div>
 </div>
 </div>

 <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
 <p>&copy; 2026 Ranote Exim. {t("footer.copyright", "All rights reserved.")}</p>
 <div className="flex gap-8 mt-4 md:mt-0">
 <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/privacy">
 {t("footer.privacy", "Privacy Policy")}
 </Link>
 <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/terms">
 {t("footer.terms", "Terms of Service")}
 </Link>
 <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/cookies">
 {t("footer.cookies", "Cookie Settings")}
 </Link>
 </div>
 </div>
 </div>
 </footer>
 );
}
