"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 // Log dashboard specific errors
 console.error("Dashboard Error:", error);
 }, [error]);

 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-card rounded-xl border border-destructive/20 mt-6 mx-6">
 <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
 <AlertCircle className="h-8 w-8" />
 </div>
 
 <h2 className="text-2xl font-semibold mb-2 text-foreground">Failed to load dashboard data</h2>
 <p className="text-muted-foreground max-w-md mb-8">
 We encountered a problem while trying to display this section. This might be due to a temporary network issue or a server error.
 </p>
 
 <div className="p-4 bg-muted/50 rounded-lg text-left text-sm font-mono overflow-auto max-w-lg mb-8 mx-auto w-full">
 <p className="text-destructive/80 text-xs uppercase font-bold tracking-wider mb-1">Error Details</p>
 <p className="text-muted-foreground truncate">{error.message || "Unknown error"}</p>
 </div>

 <button
 onClick={() => reset()}
 className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
 >
 <RefreshCw className="mr-2 h-4 w-4" />
 Retry Loading
 </button>
 </div>
 );
}
