'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Shield, Mail, Phone, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Only show footer on the homepage
  if (pathname !== '/') return null;

  return (

    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Renote Exim</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The world's most advanced B2B platform for global trade. Connecting verified exporters and importers with seamless trade tools.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Github className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-white font-semibold mb-6">Marketplace</h4>
            <ul className="space-y-4">
              <li><Link href="/marketplace" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Browse Products</Link></li>
              <li><Link href="/marketplace?category=TEXTILES" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Textiles & Apparel</Link></li>
              <li><Link href="/marketplace?category=MACHINES" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Industrial Machines</Link></li>
              <li><Link href="/marketplace?category=AGRICULTURE" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Agriculture</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">About Us</Link></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Pricing Plans</Link></li>
              <li><Link href="/how-it-works" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">How it Works</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6">Direct Support</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>support@renoteexim.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+1 (800) RENOTE-EX</span>
              </div>
              <div className="mt-6 flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[12px] text-blue-300 font-medium">Verified Safe Trade Platform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[12px]">
            &copy; {new Date().getFullYear()} Renote Exim Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-500 hover:text-white text-[12px] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-white text-[12px] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-slate-500 hover:text-white text-[12px] transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
