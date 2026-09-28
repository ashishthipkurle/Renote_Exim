'use client';

import HomeFooter from "@/components/homepage/HomeFooter";
import { ArrowLeft, Box, Ship, DocumentScanner, BadgeCheck, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ExportProcessPage() {
    const router = useRouter();
    
    const steps = [
        {
            icon: DocumentScanner,
            title: "1. Quotation & Agreement",
            desc: "Once you submit a request, we provide a detailed quotation including product specs, incoterms, and pricing. Upon approval, a formal sales contract is signed."
        },
        {
            icon: Box,
            title: "2. Production & Sourcing",
            desc: "We initiate the manufacturing process or source from our verified network. Strict quality checks are performed at every stage of production."
        },
        {
            icon: BadgeCheck,
            title: "3. Quality Inspection",
            desc: "Before dispatch, goods undergo rigorous pre-shipment inspection (PSI) to ensure they meet the agreed-upon international standards."
        },
        {
            icon: FileText,
            title: "4. Custom Clearance",
            desc: "Our team handles all necessary export documentation, including Commercial Invoices, Packing Lists, Certificates of Origin, and Customs Declarations."
        },
        {
            icon: Ship,
            title: "5. Freight & Delivery",
            desc: "Goods are loaded onto the vessel or aircraft. We provide real-time tracking information until the shipment reaches your designated port."
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-6 pb-12">
                <div className="container mx-auto px-4 md:px-6 mt-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-6 leading-tight">
                                Our Export Process
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mx-auto">
                                We've streamlined international trade. From the moment you request a quotation to the final delivery at your port, we handle everything with transparency and precision.
                            </p>
                        </div>

                        <div className="relative border-l-2 border-primary/20 ml-6 md:ml-12 space-y-12 pb-12">
                            {steps.map((step, idx) => (
                                <div key={idx} className="relative pl-10 md:pl-16">
                                    <div className="absolute -left-[25px] top-0 w-12 h-12 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                        <step.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                                        <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="text-center mt-12 bg-primary/5 p-12 rounded-3xl border border-primary/10">
                            <h3 className="text-3xl font-medium text-foreground mb-4">Ready to start?</h3>
                            <p className="text-muted-foreground mb-8 text-lg">Browse our products and request your first quotation today.</p>
                            <Link href="/products" className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20">
                                View Products
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <HomeFooter />
        </div>
    );
}
