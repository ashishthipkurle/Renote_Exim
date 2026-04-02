'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-black border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black ring-1 ring-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-start gap-5 relative z-10">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Compliance Protocol</h3>
                  <button 
                    onClick={() => setShowBanner(false)}
                    className="text-muted-foreground/40 hover:text-white transition-all p-1 hover:bg-white/5 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed mb-6 opacity-60">
                  Telemetry cookies are required for encrypted session integrity and security mitigation. 
                  Accepting the protocol authorizes data persistence for enhanced procurement nodes.
                </p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={acceptCookies}
                    className="flex-1 bg-white hover:bg-neutral-200 text-black rounded-xl h-12 transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-white/5"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={declineCookies}
                    className="flex-1 bg-muted/40 hover:bg-muted/60 text-white border border-border rounded-xl h-12 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
