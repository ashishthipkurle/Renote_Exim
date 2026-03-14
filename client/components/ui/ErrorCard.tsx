'use client';

import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 text-red-500">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
        {error?.message || description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {reset && (
          <Button 
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 h-11 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        <Button 
          asChild
          variant="outline"
          className="border-slate-800 hover:bg-slate-900 text-slate-300 px-6 h-11 rounded-xl transition-all flex items-center gap-2"
        >
          <Link href="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <pre className="mt-12 p-4 bg-slate-950 border border-slate-900 rounded-lg text-left text-[11px] text-red-400 font-mono overflow-auto max-w-2xl w-full">
          {error.stack}
        </pre>
      )}
    </div>
  );
}
