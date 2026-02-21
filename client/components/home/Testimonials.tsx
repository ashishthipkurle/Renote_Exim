"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Export Manager",
    company: "Global Textiles Ltd",
    country: "India",
    image: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "Renote Exim has transformed our export business. We've connected with reliable importers from 15 countries in just 6 months. The platform is intuitive and the support team is exceptional.",
  },
  {
    name: "Maria Santos",
    role: "Chief Procurement Officer",
    company: "Santos Trading Co",
    country: "Brazil",
    image: "https://i.pravatar.cc/150?img=45",
    rating: 5,
    text: "Finding verified suppliers used to take weeks. Now we can source products and negotiate deals in days. The analytics features help us make informed purchasing decisions.",
  },
  {
    name: "David Chen",
    role: "International Trade Director",
    company: "Pacific Commerce",
    country: "Singapore",
    image: "https://i.pravatar.cc/150?img=33",
    rating: 5,
    text: "The security and transparency of this platform gave us confidence to scale our operations. Real-time tracking and compliance document management are game-changers.",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Trusted Worldwide
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See what our customers say about their experience with Renote Exim.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative h-full p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote size={48} className="text-blue-600" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 leading-relaxed mb-6 relative z-10">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 relative">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-xs text-slate-500">
                      {testimonial.company} • {testimonial.country}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
