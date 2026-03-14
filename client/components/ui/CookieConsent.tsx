'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-blue-500/10 ring-1 ring-white/10">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">Cookie Policy</h3>
                  <button 
                    onClick={() => setShowBanner(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  We use cookies to enhance your experience, analyze our traffic, and for security purposes. By clicking "Accept", you agree to our use of cookies.
                </p>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={acceptCookies}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 transition-all font-medium"
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={declineCookies}
                    className="flex-1 border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl h-10 transition-all font-medium"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
