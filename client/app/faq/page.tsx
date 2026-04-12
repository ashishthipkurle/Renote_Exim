'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
 {
 question: "What is Renote Exim?",
 answer: "Renote Exim is a premium B2B platform designed to connect global exporters and importers. We provide tools for product discovery, secure messaging, and trade management."
 },
 {
 question: "How do I verify my account?",
 answer: "Verification requires submitting business documents such as your incorporation certificate and tax ID. Once submitted, our team reviews your profile within 48-72 hours."
 },
 {
 question: "Is payment processing secure?",
 answer: "Yes, all payments are handled by Stripe, a world-class payment processor. We do not store your credit card information on our servers."
 },
 {
 question: "Can I manage multiple shipments?",
 answer: "Absolutely. Our dashboard allows you to track and manage multiple orders and shipments simultaneously, with real-time status updates."
 },
 {
 question: "How does the messaging system work?",
 answer: "We provide a real-time encrypted messaging interface where importers and exporters can negotiate terms, share documents, and finalize trade details directly."
 }
];

export default function FAQ() {
 const [openIndex, setOpenIndex] = useState<number | null>(0);
 const [searchQuery, setSearchQuery] = useState('');

 const filteredFaqs = faqs.filter(faq => 
 faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
 faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="min-h-screen bg-slate-950 pt-32 pb-24">
 <div className="max-w-3xl mx-auto px-6">
 <div className="text-center mb-16">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6">
 <HelpCircle className="w-3.5 h-3.5" />
 Support Center
 </div>
 <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">How can we help?</h1>
 <p className="text-slate-400 text-lg max-w-xl mx-auto">
 Find answers to common questions about Renote Exim. If you can't find what you're looking for, please contact our support team.
 </p>

 <div className="mt-12 relative max-w-xl mx-auto">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
 <input 
 type="text"
 placeholder="Search for questions..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-lg pl-12 pr-6 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
 />
 </div>
 </div>

 <div className="space-y-4">
 {filteredFaqs.map((faq, index) => (
 <div 
 key={index}
 className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden overflow-visible"
 >
 <button 
 onClick={() => setOpenIndex(openIndex === index ? null : index)}
 className="w-full flex items-center justify-between p-6 text-left group"
 >
 <span className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
 {faq.question}
 </span>
 {openIndex === index ? (
 <ChevronUp className="w-5 h-5 text-blue-500" />
 ) : (
 <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
 )}
 </button>
 
 <AnimatePresence>
 {openIndex === index && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50">
 {faq.answer}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </div>

 <div className="mt-20 p-8 bg-blue-600 rounded-lg relative overflow-hidden group">
 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
 <div className="text-center md:text-left">
 <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
 <p className="text-blue-100 ">Can't find the answer you're looking for? Please chat to our friendly team.</p>
 </div>
 <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all">
 <MessageCircle className="w-5 h-5" />
 Get in Touch
 </button>
 </div>
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
 </div>
 </div>
 </div>
 );
}
