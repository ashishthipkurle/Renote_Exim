'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/client';
import { languages, cookieName } from '@/lib/i18n/config';
import { Globe, ChevronDown, Check } from 'lucide-react';
import Cookies from 'js-cookie';

const languageNames: Record<string, string> = {
 en: 'English',
 hi: 'हिन्दी',
 ja: '日本語',
 zh: '简体中文'
};

export default function LanguageSwitcher() {
 const { i18n } = useTranslation();
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 if (!mounted) return null;

 const currentLanguage = i18n.language || 'en';

 const changeLanguage = (lng: string) => {
 i18n.changeLanguage(lng);
 Cookies.set(cookieName, lng, { path: '/' });
 setIsOpen(false);
 };

 return (
 <div className="relative" ref={dropdownRef}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 transition-all active:scale-95 text-sm font-medium"
 aria-haspopup="true"
 aria-expanded={isOpen}
 >
 <Globe className="w-4 h-4 text-primary" />
 <span className="hidden sm:inline">{languageNames[currentLanguage]}</span>
 <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
 </button>

 {isOpen && (
 <div className="absolute right-0 mt-2 w-48 p-1.5 rounded-lg border border-border dark:border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 z-[60]">
 <div className="py-1 px-2 border-b border-border/50 mb-1">
 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Language</span>
 </div>
 <div className="space-y-1">
 {languages.map((lng) => (
 <button
 key={lng}
 onClick={() => changeLanguage(lng)}
 className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
 currentLanguage === lng 
 ? 'bg-primary/10 text-primary font-bold' 
 : 'hover:bg-secondary text-foreground font-medium'
 }`}
 >
 <span>{languageNames[lng]}</span>
 {currentLanguage === lng && <Check className="w-4 h-4" />}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
