'use client';

import HomeFooter from "@/components/homepage/HomeFooter";
import { ArrowLeft, Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
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
                    
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
                        {/* Contact Information Side */}
                        <div className="w-full lg:w-5/12 space-y-10">
                            <div>
                                <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-6 leading-tight">
                                    Get in Touch
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    Whether you're looking to source products, request a quotation, or explore a partnership, our team is ready to assist you.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">Headquarters</h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            RANOTE EXIM PRIVATE LIMITED<br />
                                            Kolhapur, Maharashtra<br />
                                            India
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">Email Us</h4>
                                        <a href="mailto:connect@ranoteexim.com" className="text-primary hover:underline">
                                            connect@ranoteexim.com
                                        </a>
                                        <p className="text-muted-foreground text-sm mt-1">We aim to reply within 24 hours.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">Call Us</h4>
                                        <a href="tel:+919225125205" className="text-primary hover:underline block">
                                            +91 9225125205
                                        </a>
                                        <a href="tel:+919370366075" className="text-primary hover:underline block">
                                            +91 9370366075
                                        </a>
                                        <p className="text-muted-foreground text-sm mt-1">Mon-Fri from 9am to 6pm (IST).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Side */}
                        <div className="w-full lg:w-7/12 bg-card p-8 md:p-10 rounded-3xl border border-border shadow-xl">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageSquare className="w-6 h-6 text-primary" />
                                <h3 className="text-2xl font-medium text-foreground">Send us a Message</h3>
                            </div>
                            
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">First Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Last Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Doe" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Email Address</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="john@company.com" />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Company</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Your Company Ltd." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Message</label>
                                    <textarea rows={5} className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
                                </div>
                                
                                <button type="button" className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    Send Message
                                </button>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    By submitting this form you agree to our Terms and Privacy Policy.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <HomeFooter />
        </div>
    );
}
