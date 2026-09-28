'use client';

import Image from "next/image";
import HomeFooter from "@/components/homepage/HomeFooter";
import { ArrowLeft, Search, ShieldCheck, Globe, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SourcingPage() {
    const router = useRouter();
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
                    <div className="w-full flex flex-col md:flex-row gap-12">
                        {/* Left side Image */}
                        <div className="w-full h-[40vh] md:h-[80vh] md:w-5/12 shrink-0 relative rounded-2xl overflow-hidden shadow-2xl bg-muted flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10" />
                            <Search className="w-32 h-32 text-primary/30 z-0" />
                        </div>

                        {/* Right side Text Content */}
                        <div className="w-full md:w-7/12 overflow-y-auto">
                            <div className="max-w-3xl space-y-12 pb-12 pr-4">
                                <div>
                                    <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-8 leading-tight">
                                        Global Sourcing Solutions
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        At RANOTE EXIM, we simplify the complexities of international procurement. Our sourcing division operates as your extended procurement arm in India, ensuring you get the highest quality products at competitive market rates.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Verified Suppliers</h3>
                                        <p className="text-muted-foreground">We rigorously audit and verify all our manufacturing partners across India to ensure compliance with global quality standards.</p>
                                    </div>
                                    <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Market Intelligence</h3>
                                        <p className="text-muted-foreground">Leverage our deep understanding of the Indian manufacturing ecosystem to find the most cost-effective sourcing regions.</p>
                                    </div>
                                    <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                            <PackageCheck className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Quality Assurance</h3>
                                        <p className="text-muted-foreground">End-to-end quality control from raw material inspection to pre-shipment verification.</p>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">Start Sourcing Today</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                                        Browse our curated marketplace of verified Indian export products or contact our sourcing team for custom manufacturing requirements.
                                    </p>
                                    <Link href="/products" className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20">
                                        Browse Marketplace
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <HomeFooter />
        </div>
    );
}
