"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, Download, Loader2 } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onUpdateStatus: (status: string) => Promise<void>;
  onExport: () => void;
}

const BULK_STATUSES = [
  { value: "QUOTE_CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function BulkActionsBar({
  selectedCount,
  onDeselectAll,
  onUpdateStatus,
  onExport,
}: BulkActionsBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setLoading(true);
    try {
      await onUpdateStatus(status);
    } finally {
      setLoading(false);
      setShowStatusMenu(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-foreground dark:bg-card rounded-xl shadow-2xl border border-border/50 backdrop-blur-xl">
            {/* Selected count */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                {selectedCount}
              </div>
              <span className="text-sm font-medium text-background dark:text-foreground whitespace-nowrap">
                selected
              </span>
            </div>

            <div className="w-px h-6 bg-muted-foreground/20" />

            {/* Update Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-background/15 dark:bg-muted hover:bg-background/25 dark:hover:bg-muted/80 text-background dark:text-foreground transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
                Update status
              </button>

              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full left-0 mb-2 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                  >
                    {BULK_STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => handleStatusUpdate(s.value)}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export selected */}
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-background/15 dark:bg-muted hover:bg-background/25 dark:hover:bg-muted/80 text-background dark:text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <div className="w-px h-6 bg-muted-foreground/20" />

            {/* Deselect all */}
            <button
              onClick={onDeselectAll}
              className="p-1.5 rounded-lg hover:bg-background/15 dark:hover:bg-muted text-background/60 dark:text-muted-foreground hover:text-background dark:hover:text-foreground transition-colors"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
