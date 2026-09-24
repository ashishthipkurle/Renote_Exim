'use client';

import Image from "next/image";
import HomeFooter from "@/components/homepage/HomeFooter";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
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
                        <div className="w-full h-[40vh] md:h-[80vh] md:w-5/12 shrink-0 relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/assets/UserImage.png"
                                alt="Managing Director"
                                fill
                                className="object-cover object-top"
                            />
                        </div>

                        {/* Right side Text Content */}
                        <div className="w-full md:w-7/12 overflow-y-auto">
                            <div className="max-w-3xl space-y-12 pb-12 pr-4">
                                <div>
                                    <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-8 leading-tight">
                                        RANOTE EXIM: Building India’s Sustainable Export Future
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Incorporated in 2025, RANOTE EXIM PRIVATE LIMITED is steadily carving its identity as a responsible and mission-driven Indian export enterprise headquartered in Kolhapur, Maharashtra.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Founded by Subhash Tukaram Pote and led by Managing Director Ranjeet Subhash Pote, RANOTE EXIM operates with a clearly defined purpose — to strengthen India’s global presence through quality-driven, compliant, and environmentally responsible products.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-4">OUR MISSION</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                                        To connect international buyers with reliable Indian products and sourcing opportunities through transparent, responsible and quality-focused trade.
                                    </p>

                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-4">OUR VISION</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        To build RANOTE EXIM into a trusted Indian export and global sourcing partner for international businesses.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">CORE VALUES</h3>
                                    <ul className="space-y-6">
                                        <li>
                                            <h4 className="text-xl font-bold text-foreground mb-2">QUALITY</h4>
                                            <p className="text-muted-foreground text-lg">We focus on product specifications and buyer requirements.</p>
                                        </li>
                                        <li>
                                            <h4 className="text-xl font-bold text-foreground mb-2">TRUST</h4>
                                            <p className="text-muted-foreground text-lg">We believe in clear and transparent business communication.</p>
                                        </li>
                                        <li>
                                            <h4 className="text-xl font-bold text-foreground mb-2">RESPONSIBILITY</h4>
                                            <p className="text-muted-foreground text-lg">We work towards responsible and compliant trade practices.</p>
                                        </li>
                                        <li>
                                            <h4 className="text-xl font-bold text-foreground mb-2">SUSTAINABILITY</h4>
                                            <p className="text-muted-foreground text-lg">We promote suitable sustainable and eco-friendly product categories.</p>
                                        </li>
                                        <li>
                                            <h4 className="text-xl font-bold text-foreground mb-2">PARTNERSHIPS</h4>
                                            <p className="text-muted-foreground text-lg">We aim to build long-term relationships with buyers and suppliers.</p>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">OUR GROWTH</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        RANOTE EXIM is building its international business step by step by expanding product categories, strengthening supplier relationships and exploring new export markets.
                                    </p>
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
