"use client";

import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
                <span className="material-icons text-sm">public</span>
              </div>
              <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                RANOTE<span className="text-primary">EXIM</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-6">
              Reimagining global trade infrastructure for the digital age. Secure, fast, and transparent.
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
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-500">
              <li>
                <Link className="hover:text-primary transition-colors" href="/products">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/dashboard/admin/shipments">
                  Logistics
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/dashboard/admin/analytics">
                  Finance
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/dashboard/admin/notifications">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-500">
              <li>
                <Link className="hover:text-primary transition-colors" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/careers">
                  Careers
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/press">
                  Press
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Subscribe</h4>
            <p className="text-slate-600 dark:text-slate-500 text-sm mb-4">Get the latest trade insights.</p>
            <div className="flex shadow-sm rounded-l-lg">
              <input
                className="bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-l-lg px-4 py-3 text-sm w-full focus:outline-none focus:border-primary transition-colors"
                placeholder="Email address"
                type="email"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors primary-glow-hover" type="button" aria-label="Subscribe">
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-600">
          <p>&copy; 2026 Ranote Exim. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/terms">
              Terms of Service
            </Link>
            <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/cookies">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
