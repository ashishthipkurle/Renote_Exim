'use client';

import HomeFooter from "@/components/homepage/HomeFooter";
import { ArrowLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MarketsPage() {
    const router = useRouter();
    
    const regions = [
        {
            title: "Middle East",
            countries: ["UAE", "Saudi Arabia", "Oman", "Qatar", "Kuwait", "Bahrain"],
            desc: "Serving the rapid infrastructure and consumer goods demand across the GCC region with expedited shipping lanes."
        },
        {
            title: "South Asia",
            countries: ["Sri Lanka", "Bangladesh", "Nepal", "Maldives"],
            desc: "Leveraging geographic proximity for rapid delivery of essential commodities and industrial materials."
        },
        {
            title: "South East Asia",
            countries: ["Vietnam", "Malaysia", "Singapore", "Indonesia"],
            desc: "Providing high-quality raw materials and finished goods to booming manufacturing hubs."
        },
        {
            title: "Africa",
            countries: ["Kenya", "South Africa", "Nigeria", "Tanzania"],
            desc: "Supplying agricultural machinery, textiles, and essential goods to growing African economies."
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
                    
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-6 leading-tight">
                                Global Markets
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg max-w-3xl mx-auto">
                                RANOTE EXIM's strategic location in India allows us to serve a diverse portfolio of international markets. We have established robust logistics networks ensuring timely and safe delivery across the globe.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            {regions.map((region, idx) => (
                                <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground">{region.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{region.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {region.countries.map(country => (
                                            <span key={country} className="px-3 py-1 bg-muted text-foreground text-sm font-medium rounded-full">
                                                {country}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-primary text-primary-foreground p-12 rounded-3xl text-center">
                            <h3 className="text-3xl font-medium mb-4">Don't see your region?</h3>
                            <p className="text-primary-foreground/80 mb-8 text-lg max-w-2xl mx-auto">
                                We are constantly expanding our global footprint. Contact our international trade team to discuss shipping logistics for your specific country.
                            </p>
                            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold transition-colors bg-white text-primary hover:bg-gray-100 rounded-full shadow-lg">
                                Contact Our Team
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <HomeFooter />
        </div>
    );
}
