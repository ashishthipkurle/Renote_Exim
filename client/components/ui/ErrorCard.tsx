'use client';

import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorCardProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
}

export default function ErrorCard({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Our team has been notified.",
}: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in fill-mode-both duration-700">
      <div className="w-20 h-20 bg-muted/20 backdrop-blur-3xl border border-border rounded-[2.5rem] flex items-center justify-center mb-8 text-white shadow-2xl relative group">
        <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] animate-pulse group-hover:bg-white/10 transition-colors" />
        <AlertCircle className="w-10 h-10 relative z-10" />
      </div>
      
      <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic shadow-[0_0_20px_rgba(255,255,255,0.1)]">{title}</h2>
      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] max-w-sm mx-auto mb-12 leading-relaxed opacity-60">
        {error?.message || description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-6">
        {reset && (
          <button 
            onClick={reset}
            className="bg-white hover:bg-neutral-200 text-black px-8 h-12 rounded-2xl transition-all shadow-2xl shadow-white/10 font-black uppercase tracking-[0.2em] flex items-center gap-3 text-[10px] active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            Re-Initialize
          </button>
        )}
        <Link href="/" className="bg-muted/40 hover:bg-muted/60 text-white px-8 h-12 rounded-2xl border border-border transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] hover:-translate-y-1 active:translate-y-0">
          <Home className="w-4 h-4" />
          Gateway
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <div className="mt-16 w-full max-w-2xl text-left">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1 opacity-40">System Trace Log</div>
          <pre className="p-6 bg-black border border-border rounded-2xl text-[10px] text-muted-foreground font-mono overflow-auto w-full leading-relaxed shadow-inner">
            {error.stack}
          </pre>
        </div>
      )}
    </div>
  );
}
