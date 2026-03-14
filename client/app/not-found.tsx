import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-9xl font-black text-primary/10 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium group-hover:text-primary transition-colors">Go Home</div>
                <div className="text-sm text-muted-foreground">Return to the homepage</div>
              </div>
            </div>
            <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Search className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium group-hover:text-primary transition-colors">Browse Products</div>
                <div className="text-sm text-muted-foreground">Search the global marketplace</div>
              </div>
            </div>
            <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
