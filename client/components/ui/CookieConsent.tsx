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
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100]"
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-primary/10 relative overflow-hidden group backdrop-blur-xl">
            {/* Decorative background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                <Cookie className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                    Compliance Protocol
                  </h3>
                  <button 
                    onClick={() => setShowBanner(false)}
                    className="text-muted-foreground/40 hover:text-foreground transition-all p-1 hover:bg-accent rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-muted-foreground text-[11px] leading-relaxed mb-6 font-medium">
                  We use protocol cookies to ensure encrypted session integrity and security mitigation. 
                  Accepting the protocol authorizes data persistence for optimized procurement nodes.
                </p>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={acceptCookies}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 transition-all font-black uppercase tracking-[0.1em] text-[10px] shadow-lg shadow-primary/20"
                  >
                    Accept All
                  </button>
                  <button 
                    onClick={declineCookies}
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl h-11 transition-all font-bold uppercase tracking-[0.05em] text-[10px]"
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
