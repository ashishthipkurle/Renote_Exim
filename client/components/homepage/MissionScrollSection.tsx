"use client";

import Image from "next/image";
import Link from "next/link";

export default function MissionScrollSection() {
    return (
        <section className="relative w-full py-24 z-40 bg-background overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left side Content */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        <div>
                            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-2 leading-tight">
                                YOUR INDIA-BASED
                            </h2>
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary mb-6 leading-tight">
                                EXPORT & SOURCING PARTNER
                            </h2>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            RANOTE EXIM PRIVATE LIMITED is an India-based merchant exporter and global sourcing partner headquartered in Kolhapur, Maharashtra.
                        </p>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            We help international buyers source selected products from India by coordinating with suitable manufacturers, suppliers and service partners.
                        </p>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            From product identification and supplier coordination to quality requirements, export documentation and shipment coordination, we work to make India sourcing simpler, clearer and more reliable.
                        </p>
                        
                        <div className="pt-6">
                            <Link 
                                href="/about"
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
                            >
                                ABOUT RANOTE EXIM
                                <span className="material-icons text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right side Profile & Quote */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 md:p-12 border border-border shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                            
                            <h3 className="text-2xl font-light tracking-tight text-foreground mb-1">
                                BUILT FROM INDIA.
                            </h3>
                            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-8">
                                CONNECTED TO THE WORLD.
                            </h3>
                            
                            <p className="text-muted-foreground leading-relaxed text-lg mb-10">
                                Founded in 2025, RANOTE EXIM was established with a clear objective - to connect international buyers with reliable Indian products and sourcing opportunities.
                            </p>
                            
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden relative border-2 border-primary/20 shrink-0">
                                    <Image 
                                        src="/assets/UserImage.png" 
                                        alt="Ranjeet Subhash Pote"
                                        fill
                                        className="object-cover object-top"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground text-lg">RANJEET SUBHASH POTE</h4>
                                    <p className="text-primary font-medium">Managing Director</p>
                                    <p className="text-muted-foreground text-sm mt-1">RANOTE EXIM PRIVATE LIMITED</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
