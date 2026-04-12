"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardNotFound() {
 const router = useRouter();
 
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center mt-6">
 <div className="relative mb-6">
 <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full"></div>
 <div className="relative h-20 w-20 rounded-lg bg-card border flex items-center justify-center text-muted-foreground shadow-sm">
 <FileQuestion className="h-10 w-10" />
 </div>
 </div>
 
 <h2 className="text-2xl font-semibold mb-2 text-foreground">Record Not Found</h2>
 <p className="text-muted-foreground max-w-md mb-8">
 The dashboard record you are looking for does not exist, has been deleted, or you do not have permission to view it.
 </p>

 <div className="flex gap-4">
 <button 
 onClick={() => router.back()}
 className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
 >
 <ArrowLeft className="mr-2 h-4 w-4" />
 Go Back
 </button>
 <Link
 href="/dashboard"
 className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
 >
 Dashboard Home
 </Link>
 </div>
 </div>
 );
}
