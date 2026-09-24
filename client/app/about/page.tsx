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
                                        Incorporated in 2025, RANOTE EXIM PRIVATE LIMITED is steadily carving its identity as a responsible and mission-driven Indian export enterprise headquartered in Kolhapur, Maharashtra. In an era where global trade is increasingly defined by sustainability, regulatory compliance, and ethical sourcing, the company represents a new wave of structured exporters who believe that long-term credibility matters more than short-term expansion.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Founded by Subhash Tukaram Pote and led by Managing Director Ranjeet Subhash Pote, RANOTE EXIM operates with a clearly defined purpose — to strengthen India’s global presence through quality-driven, compliant, and environmentally responsible products. The leadership firmly believes that export is not merely a business transaction but a representation of India’s manufacturing standards, reliability, and ethical commitment.
                                    </p>
                                    <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic text-xl text-foreground bg-primary/5 rounded-r-lg">
                                        “Our mission is not just to export products, but to build long-term international partnerships based on trust and consistent performance. Every shipment we send carries India’s reputation along with it.”
                                        <footer className="text-sm text-muted-foreground mt-4 not-italic font-semibold">— Managing Director Ranjeet Subhash Pote</footer>
                                    </blockquote>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        With this philosophy at its core, the company has strategically positioned itself in sectors aligned with global sustainability trends. Its product portfolio includes biodegradable packaging solutions, premium jute products, natural goods such as jaggery, and selected medical supply items. As international buyers increasingly shift toward eco-friendly alternatives and responsible sourcing, RANOTE EXIM has aligned its offerings with these evolving global expectations.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">Mission: Representing India with Responsibility</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        At the heart of RANOTE EXIM’s journey lies a mission that extends beyond commercial growth. The company views export as a national responsibility. This belief shapes its operational systems — from careful vendor selection and strict quality benchmarking to detailed documentation processes and disciplined shipment timelines.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Transparency, compliance, and performance consistency form the foundation of its export framework. Each consignment is processed through structured internal checks to ensure adherence to buyer specifications and international trade regulations. By prioritizing biodegradable and environmentally responsible products, the company contributes to the global transition toward sustainable consumption while promoting Indian manufacturing excellence.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        The leadership emphasizes that global buyers today seek more than competitive pricing. They demand traceability, documentation clarity, and reliable supply chains. Recognizing this shift, RANOTE EXIM has built its systems around accountability and long-term relationship building.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">Vision: Building Global Credibility Through Structured Growth</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Unlike companies that pursue rapid and unstructured expansion, RANOTE EXIM has adopted a measured and scalable growth model. Its vision is to become a recognized and trusted export partner across Asian and Middle Eastern markets by delivering compliant, high-quality Indian products consistently.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        The leadership acknowledges that the future of international trade will be shaped by stricter regulatory standards, environmental consciousness, and dependable sourcing networks. Accordingly, the company’s roadmap focuses on strengthening internal systems before entering new markets.
                                    </p>
                                    <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic text-xl text-foreground bg-primary/5 rounded-r-lg">
                                        “Our vision is not just to expand geographically. It is to expand responsibly — ensuring that growth never compromises compliance, quality, or credibility.”
                                        <footer className="text-sm text-muted-foreground mt-4 not-italic font-semibold">— Managing Director Ranjeet Subhash Pote</footer>
                                    </blockquote>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        Global trade trends indicate that exporters who invest in documentation accuracy, ethical sourcing, and transparent communication are more likely to build sustainable international partnerships. RANOTE EXIM has integrated these principles into its core operations and continues to strengthen its foundation for sustainable long-term growth.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">Motivation: Discipline as a Competitive Advantage</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        The early phase of the company’s journey involved navigating regulatory procedures, complex export documentation requirements, supplier coordination challenges, logistics planning, and buyer confidence building — experiences common to emerging exporters.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        However, instead of treating these hurdles as setbacks, RANOTE EXIM approached them as learning milestones. Internal workflows were refined, sourcing networks were carefully strengthened, and quality control systems were formalized. This disciplined approach created operational stability and reduced risk exposure.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        The leadership strongly believes that export motivation must be strategic rather than emotional. Preparation, compliance awareness, and consistent improvement form the true backbone of sustainable growth.
                                    </p>
                                    <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic text-xl text-foreground bg-primary/5 rounded-r-lg">
                                        “Export motivation should not be driven by excitement alone. Preparedness, reliability, and structured systems are what ensure long-term success.”
                                        <footer className="text-sm text-muted-foreground mt-4 not-italic font-semibold">— Managing Director Ranjeet Subhash Pote</footer>
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">Future Planning: Structured and Scalable Expansion</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Looking ahead, RANOTE EXIM has outlined a clear and data-driven expansion strategy. The company plans to broaden its biodegradable and eco-friendly product portfolio while strengthening partnerships with verified and compliant manufacturers. Enhancing internal documentation systems and quality monitoring processes remains a top priority.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        The company also aims to expand its outreach across Malaysia, Singapore, Thailand, Vietnam, and key Middle Eastern economies. Rather than entering markets prematurely, leadership emphasizes readiness, regulatory understanding, and operational preparedness before scaling geographically.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        Additionally, RANOTE EXIM seeks to develop long-term distribution networks to support scalable operations and stable supply chains. By aligning with global sustainability transitions — particularly in packaging alternatives and environmentally responsible goods — the company intends to remain future-focused and adaptable.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">Commitment to Ethical Trade Practices</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        Integrity, transparency, compliance, and accountability remain central to RANOTE EXIM’s corporate culture. The company prioritizes long-term partnerships over transactional dealings, understanding that global trade relationships thrive on trust and consistent performance.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        Open communication with buyers, adherence to international standards, and disciplined execution form the pillars of its export philosophy. By maintaining clarity in documentation and fulfilling commitments on time, the company aims to position itself as a dependable export partner rather than merely a supplier.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium tracking-tight text-foreground mb-6">A Future-Focused Export Enterprise</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                        As sustainability becomes integral to global commerce and buyers demand greater accountability, RANOTE EXIM’s structured and mission-driven framework positions it strategically within the evolving export ecosystem. From its base in Kolhapur to expanding trade corridors across Asia and the Middle East, the company reflects a broader transformation in India’s export narrative — one where ambition is balanced by responsibility.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        With a clear mission, defined vision, and disciplined future planning, RANOTE EXIM continues to move forward — not just as an exporter, but as a representative of India’s emerging generation of globally aligned enterprises committed to sustainable and credible growth.
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
