"use client";

import { useState, useRef, useEffect } from "react";
import { Download, MoreHorizontal, Printer, FileText, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function HeaderActions() {
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Export button */}
      <button
        onClick={() => toast.success("Exporting orders...")}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {/* More actions dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMore(!showMore)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="py-1">
                <button
                  onClick={() => { toast.info("Print feature coming soon"); setShowMore(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-muted-foreground" />
                  Print orders
                </button>
                <button
                  onClick={() => { toast.info("Invoice feature coming soon"); setShowMore(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Generate invoices
                </button>
                <button
                  onClick={() => { toast.info("Tag feature coming soon"); setShowMore(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Manage tags
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
